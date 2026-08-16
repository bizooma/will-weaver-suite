-- 1. Drop the public-access (FOR ALL TO public USING true) policies.
DROP POLICY IF EXISTS "System can manage queries" ON public.voice_search_queries;
DROP POLICY IF EXISTS "System can manage results" ON public.voice_search_results;
DROP POLICY IF EXISTS "System can manage analysis" ON public.voice_search_analysis;

-- 2. Remove orphans so the FK constraints can be created.
DELETE FROM public.voice_search_results r
WHERE NOT EXISTS (SELECT 1 FROM public.voice_search_queries q WHERE q.id = r.query_id);

DELETE FROM public.voice_search_queries q
WHERE NOT EXISTS (SELECT 1 FROM public.voice_search_tests t WHERE t.id = q.test_id);

DELETE FROM public.voice_search_analysis a
WHERE NOT EXISTS (SELECT 1 FROM public.voice_search_tests t WHERE t.id = a.test_id);

-- 3. Referential integrity with cascade delete.
ALTER TABLE public.voice_search_queries
  ADD CONSTRAINT voice_search_queries_test_id_fkey
  FOREIGN KEY (test_id) REFERENCES public.voice_search_tests(id) ON DELETE CASCADE;

ALTER TABLE public.voice_search_results
  ADD CONSTRAINT voice_search_results_query_id_fkey
  FOREIGN KEY (query_id) REFERENCES public.voice_search_queries(id) ON DELETE CASCADE;

ALTER TABLE public.voice_search_analysis
  ADD CONSTRAINT voice_search_analysis_test_id_fkey
  FOREIGN KEY (test_id) REFERENCES public.voice_search_tests(id) ON DELETE CASCADE;