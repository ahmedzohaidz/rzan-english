# rzan-english — English Learning Platform

## Identity
Student: Rzan, age 12, grade 7, Saudi Arabia
Loves: Writing novels and creative storytelling
Father: Abu Mane3 (monitors via /parent dashboard)

## Stack
- Next.js 14 + TypeScript + Tailwind CSS + App Router
- Supabase ref: nliyfziqtpfmvbrgtsmk
- Deploy: Vercel → rzan.diagpro.tech
- AI: claude-sonnet-4-20250514
- WhatsApp Business API (already integrated in DiagPro)

## Colors (DiagPro Brand)
- Gold: #FFD100  |  Black: #0A0A0A
- Purple: #9b59ff  |  Pink: #ff6eb4  |  Mint: #4fffb0

## Fonts
- Arabic UI: Tajawal
- English headings: Playfair Display
- Direction: RTL default, LTR for English content blocks

## Auth
- Rzan login: name only — no password
- Parent login: 4-digit PIN (default: 1234)

## Supabase — Existing Tables (DO NOT TOUCH)
customers, vehicles, bookings, orders, technicians,
services, order_items, fault_codes, payments, whatsapp_logs

## Supabase — New Tables to Create
rzan_profile, rzan_sessions, rzan_vocabulary,
rzan_writing_journal, rzan_missions

## Build Order (follow exactly)
1. Project setup + folder structure + env
2. Supabase migrations (5 new tables)
3. Auth pages (login + parent PIN)
4. Diagnostic test (4 stages)
5. Dashboard + daily mission
6. AI Teacher chat (streaming)
7. Writing workshop
8. Points & achievements
9. Parent dashboard
10. WhatsApp report + PWA + Deploy

## Key Rules
- Mobile-first — Rzan uses Android phone
- Every exercise must connect to storytelling/novels
- Encouragement messages: warm, personal, in Arabic
- Spaced repetition for vocabulary she gets wrong
- Parent dashboard at /parent route (PIN protected)
- All API keys only in .env.local — never hardcoded
