import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, differenceInDays, parseISO, addDays } from 'date-fns';

export interface Soft75Rule {
  id: string;
  challenge_id: string;
  label: string;
  emoji: string | null;
  description: string | null;
  order_index: number;
  archived_at: string | null;
  created_at: string;
}

export interface Soft75Challenge {
  id: string;
  user_id: string;
  start_date: string;
  status: string;
  created_at: string;
}

export interface Soft75Log {
  id: string;
  challenge_id: string;
  rule_id: string;
  log_date: string;
  completed: boolean;
}

export interface NewRuleInput {
  label: string;
  emoji?: string;
  description?: string;
}

export const useSoft75 = () => {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Soft75Challenge | null>(null);
  const [rules, setRules] = useState<Soft75Rule[]>([]);
  const [logs, setLogs] = useState<Soft75Log[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: challenges } = await supabase
      .from('soft75_challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1);

    const active = challenges?.[0] as Soft75Challenge | undefined;
    if (!active) {
      setChallenge(null);
      setRules([]);
      setLogs([]);
      setLoading(false);
      return;
    }
    setChallenge(active);

    const [{ data: ruleRows }, { data: logRows }] = await Promise.all([
      supabase.from('soft75_rules').select('*').eq('challenge_id', active.id).order('order_index'),
      supabase.from('soft75_daily_logs').select('*').eq('challenge_id', active.id),
    ]);
    setRules((ruleRows ?? []) as Soft75Rule[]);
    setLogs((logRows ?? []) as Soft75Log[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const createChallenge = useCallback(async (startDate: string, newRules: NewRuleInput[]) => {
    if (!user) return;
    const { data: ch, error } = await supabase
      .from('soft75_challenges')
      .insert({ user_id: user.id, start_date: startDate, status: 'active' })
      .select()
      .single();
    if (error || !ch) {
      toast.error('Failed to start challenge');
      return;
    }
    const ruleRows = newRules.map((r, i) => ({
      challenge_id: ch.id,
      label: r.label,
      emoji: r.emoji ?? null,
      description: r.description ?? null,
      order_index: i,
    }));
    if (ruleRows.length > 0) {
      const { error: ruleErr } = await supabase.from('soft75_rules').insert(ruleRows);
      if (ruleErr) {
        toast.error('Failed to add rules');
        return;
      }
    }
    toast.success('Challenge started!');
    await loadAll();
  }, [user, loadAll]);

  const addRule = useCallback(async (input: NewRuleInput) => {
    if (!challenge) return;
    const orderIndex = rules.length > 0 ? Math.max(...rules.map((r) => r.order_index)) + 1 : 0;
    const { error } = await supabase.from('soft75_rules').insert({
      challenge_id: challenge.id,
      label: input.label,
      emoji: input.emoji ?? null,
      description: input.description ?? null,
      order_index: orderIndex,
    });
    if (error) toast.error('Failed to add rule');
    else await loadAll();
  }, [challenge, rules, loadAll]);

  const updateRule = useCallback(async (ruleId: string, patch: Partial<NewRuleInput>) => {
    const { error } = await supabase.from('soft75_rules').update({
      label: patch.label,
      emoji: patch.emoji,
      description: patch.description,
    }).eq('id', ruleId);
    if (error) toast.error('Failed to update rule');
    else await loadAll();
  }, [loadAll]);

  const archiveRule = useCallback(async (ruleId: string) => {
    const { error } = await supabase.from('soft75_rules').update({
      archived_at: new Date().toISOString(),
    }).eq('id', ruleId);
    if (error) toast.error('Failed to remove rule');
    else await loadAll();
  }, [loadAll]);

  const toggleLog = useCallback(async (ruleId: string, date: string) => {
    if (!challenge) return;
    const existing = logs.find((l) => l.rule_id === ruleId && l.log_date === date);
    if (existing) {
      const { error } = await supabase.from('soft75_daily_logs').delete().eq('id', existing.id);
      if (error) toast.error('Failed to update');
      else setLogs((prev) => prev.filter((l) => l.id !== existing.id));
    } else {
      const { data, error } = await supabase.from('soft75_daily_logs').insert({
        challenge_id: challenge.id,
        rule_id: ruleId,
        log_date: date,
        completed: true,
      }).select().single();
      if (error) toast.error('Failed to update');
      else if (data) setLogs((prev) => [...prev, data as Soft75Log]);
    }
  }, [challenge, logs]);

  const endChallenge = useCallback(async () => {
    if (!challenge) return;
    const { error } = await supabase.from('soft75_challenges')
      .update({ status: 'abandoned' }).eq('id', challenge.id);
    if (error) toast.error('Failed to end challenge');
    else await loadAll();
  }, [challenge, loadAll]);

  // Derived helpers
  const today = format(new Date(), 'yyyy-MM-dd');
  const dayNumber = challenge ? differenceInDays(new Date(today), parseISO(challenge.start_date)) + 1 : 0;

  const activeRulesForDate = useCallback((date: string) => {
    return rules.filter((r) => !r.archived_at || r.archived_at.slice(0, 10) > date);
  }, [rules]);

  const isDayComplete = useCallback((date: string) => {
    const active = activeRulesForDate(date);
    if (active.length === 0) return false;
    return active.every((r) => logs.some((l) => l.rule_id === r.id && l.log_date === date && l.completed));
  }, [activeRulesForDate, logs]);

  const dayStatuses = useCallback(() => {
    if (!challenge) return [];
    const todayDate = new Date(today);
    return Array.from({ length: 75 }, (_, i) => {
      const d = format(addDays(parseISO(challenge.start_date), i), 'yyyy-MM-dd');
      const dDate = parseISO(d);
      if (dDate > todayDate) return { date: d, status: 'future' as const };
      const active = activeRulesForDate(d);
      const completedCount = active.filter((r) => logs.some((l) => l.rule_id === r.id && l.log_date === d)).length;
      if (active.length === 0) return { date: d, status: 'future' as const };
      if (completedCount === active.length) return { date: d, status: 'complete' as const };
      if (completedCount > 0) return { date: d, status: 'partial' as const };
      return { date: d, status: 'missed' as const };
    });
  }, [challenge, today, activeRulesForDate, logs]);

  const completedDaysCount = challenge
    ? dayStatuses().filter((d) => d.status === 'complete').length
    : 0;

  return {
    loading,
    challenge,
    rules,
    logs,
    dayNumber,
    completedDaysCount,
    activeRulesForDate,
    isDayComplete,
    dayStatuses,
    createChallenge,
    addRule,
    updateRule,
    archiveRule,
    toggleLog,
    endChallenge,
  };
};
