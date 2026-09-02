import { expect, Page, test } from '@playwright/test';

const baby = {
  id: '00000000-0000-4000-8000-000000000001',
  user_id: '00000000-0000-4000-8000-000000000002',
  name: '토닥이',
  birth_date: '2026-01-01',
  due_date: '2026-03-01',
  gender: 'F',
  birth_weight: 1.8,
  birth_height: 42,
  medical_history: [],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const session = {
  id: '00000000-0000-4000-8000-000000000010',
  user_id: baby.user_id,
  baby_id: baby.id,
  title: '수유 코칭',
  is_active: true,
  started_at: '2026-08-25T00:00:00Z',
  updated_at: '2026-08-25T00:00:00Z',
  message_count: 2,
};

const interaction = (kind: string, prompt: string, options: Array<{ id: string; label: string }> = []) => ({
  id: crypto.randomUUID(),
  kind,
  prompt,
  options,
  allow_free_text: true,
});

const sse = (...events: unknown[]) => events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('');

async function prepareUser(page: Page, detail: Record<string, unknown>) {
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'e2e-token');
    localStorage.setItem('user', JSON.stringify({
      id: '00000000-0000-4000-8000-000000000002',
      email: 'parent@example.com',
      nickname: '보호자',
      role: 'USER',
      created_at: '2026-01-01T00:00:00Z',
    }));
  });
  await page.route('**/api/v1/babies', (route) => route.fulfill({ json: [baby] }));
  await page.route('**/api/v1/chat/sessions**', (route) => {
    const pathname = new URL(route.request().url()).pathname;
    route.fulfill({ json: pathname.endsWith('/sessions') ? [session] : detail });
  });
}

async function openChat(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '대화 시작하기' }).click();
  await expect(page).toHaveURL(/\/chat$/);
}

test('버튼 선택 후 새로고침해도 현재 코칭 상호작용을 복구한다', async ({ page }) => {
  const restoredGoal = interaction('GOAL_INPUT', '이번 코칭에서 가장 먼저 달라졌으면 하는 점은 무엇인가요?');
  await prepareUser(page, {
    ...session,
    messages: [],
    coaching: {
      episode_id: '00000000-0000-4000-8000-000000000020',
      status: 'WAITING_USER',
      phase: 'GOAL',
      pending_interaction: restoredGoal,
      next_actions: [],
    },
  });

  let requestCount = 0;
  await page.route('**/api/v1/chat/message', async (route) => {
    requestCount += 1;
    const next = requestCount === 1
      ? interaction('COACHING_CONSENT', '코칭으로 진행할까요?', [
          { id: 'accept', label: '코칭으로 진행' },
          { id: 'decline', label: '정보만 보기' },
        ])
      : restoredGoal;
    await route.fulfill({
      contentType: 'text/event-stream',
      body: sse(
        { type: 'interaction', episode_id: '00000000-0000-4000-8000-000000000020', phase: requestCount === 1 ? 'CONSENT' : 'GOAL', interaction: next },
        { type: 'done', response: next.prompt, session_id: session.id, is_emergency: false, rag_sources: [], qna_sources: [], response_time: 0.1, coaching: { episode_id: '00000000-0000-4000-8000-000000000020', status: 'WAITING_USER', phase: requestCount === 1 ? 'CONSENT' : 'GOAL', attempt_count: 0 } },
      ),
    });
  });

  await openChat(page);
  await page.getByPlaceholder('Todac에게 물어보기').fill('수유 방법을 함께 계획하고 싶어요');
  await page.getByPlaceholder('Todac에게 물어보기').press('Enter');
  await page.getByRole('button', { name: '코칭으로 진행' }).click();
  await expect(page.getByText(restoredGoal.prompt).last()).toBeVisible();

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: '대화 시작하기' }).click();
  await page.getByRole('button', { name: '채팅 목록 열기' }).click();
  await page.getByText('수유 코칭').click();
  await expect(page.getByText(restoredGoal.prompt).last()).toBeVisible();
});

test('완료된 목표에서 새 Episode의 Goal 단계로 바로 이동한다', async ({ page }) => {
  await prepareUser(page, {
    ...session,
    messages: [],
    coaching: {
      episode_id: '00000000-0000-4000-8000-000000000030',
      status: 'COMPLETED',
      phase: 'COMPLETE',
      pending_interaction: null,
      next_actions: [
        { id: 'new_goal', label: '새 목표 시작' },
        { id: 'other_question', label: '다른 질문' },
        { id: 'finish', label: '종료' },
      ],
    },
  });
  const goal = interaction('GOAL_INPUT', '새 목표를 구체적으로 알려주세요.');
  await page.route('**/api/v1/chat/message', async (route) => {
    expect(route.request().postDataJSON().selected_option_id).toBe('new_goal');
    await route.fulfill({
      contentType: 'text/event-stream',
      body: sse(
        { type: 'interaction', episode_id: '00000000-0000-4000-8000-000000000031', phase: 'GOAL', interaction: goal },
        { type: 'done', response: goal.prompt, session_id: session.id, is_emergency: false, rag_sources: [], qna_sources: [], response_time: 0.1, coaching: { episode_id: '00000000-0000-4000-8000-000000000031', status: 'WAITING_USER', phase: 'GOAL', attempt_count: 0 } },
      ),
    });
  });

  await openChat(page);
  await page.getByRole('button', { name: '채팅 목록 열기' }).click();
  await page.getByText('수유 코칭').click();
  await page.getByRole('button', { name: '새 목표 시작' }).click();
  await expect(page.getByText(goal.prompt).last()).toBeVisible();
  await expect(page.getByText('코칭으로 진행할까요?')).toHaveCount(0);
});
