CREATE POLICY "Users can insert their own ai visibility runs"
ON public.ai_visibility_runs FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert results for their own runs"
ON public.ai_visibility_results FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ai_visibility_runs r
  WHERE r.id = run_id AND r.user_id = auth.uid()
));