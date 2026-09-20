-- ============================================================
-- Migration: Adiciona campos de assinatura Stripe à tabela barbershops
-- 
-- Execute este script no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ykonhaiznasgqpqjkcwg/sql
--
-- Este script é idempotente: usa IF NOT EXISTS e verifica se a
-- coluna já existe antes de adicionar. Pode ser executado mais
-- de uma vez sem erro.
-- ============================================================

-- Stripe Customer ID (ex: cus_...)
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Stripe Subscription ID (ex: sub_...)
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- Stripe Price ID (ex: price_...)
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

-- Status da assinatura (trialing | active | past_due | canceled | unpaid)
-- Atualizado exclusivamente via webhook do Stripe.
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50);

-- Início da assinatura/trial
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS subscription_start TIMESTAMPTZ;

-- Fim do período de cobrança atual (ou data de cancelamento futuro)
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS subscription_end TIMESTAMPTZ;

-- Início do período de teste (trial)
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ;

-- Fim do período de teste (trial) — após esta data o Stripe cobra automaticamente
ALTER TABLE barbershops
  ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- ============================================================
-- Verificação: lista as novas colunas para confirmar o sucesso
-- ============================================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'barbershops'
  AND column_name IN (
    'stripe_customer_id',
    'stripe_subscription_id',
    'stripe_price_id',
    'subscription_status',
    'subscription_start',
    'subscription_end',
    'trial_start',
    'trial_end'
  )
ORDER BY column_name;
