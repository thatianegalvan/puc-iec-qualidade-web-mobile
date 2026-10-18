// tests/desafios/02-expect-espera.spec.ts
// ─────────────────────────────────────────────────────────────────────────────
// ✅ AVALIATIVO — BLOCO B · EXPECT E ESPERA (≈ 25 min)
//
// 🎯 Objetivo do bloco: nunca mais "esperar 2 segundos e torcer". O Playwright
//    espera sozinho (auto-wait) se você usar o expect CERTO.
//
// 📚 Conectado com a Aula 3 (SPA: o app "monta" depois do HTML chegar → esperar
//    por sinal, não por tempo) e com o data-app-ready.
//    Novo: toHaveCount · pressSequentially · locator CSS por prefixo [data-testid^=…]
//          expect.poll · expect.soft.    Estudar: https://playwright.dev/docs/test-assertions  ·  https://playwright.dev/docs/actionability  ·  page.evaluate: https://playwright.dev/docs/evaluating
//
// ✅ Validar:  npx playwright test 02-expect   (e a linha falta('B?') precisa sumir)
// ─────────────────────────────────────────────────────────────────────────────

import { test, expect } from '@playwright/test';
import { falta } from '../support/todo';

test.describe('Bloco B — expect e espera', () => {
  // ── B1 🟢 · ≈ 4 min ────────────────────────────────────────────────────────
  // 📚 Aprende: toHaveCount (conta e ESPERA chegar no número) e toBeHidden
  // 🧩 O catálogo de /qa tem 36 filmes e mostra 12 por vez. O primeiro expect está
  //    pronto — repita o padrão: clique em "Carregar mais" e confira 24, clique de
  //    novo e confira 36; no fim o botão "Carregar mais" não pode mais existir.
  // 🆘 Dica: guarde os locators em variáveis (cards, loadMore) e reuse.
  test('B1. paginação: 12 → 24 → 36 e o botão some', async ({ page }) => {
    await page.goto('/qa');
    const cards = page.getByRole('article');
    const loadMore = page.getByTestId('movielist-load-more-button');

    await expect(cards).toHaveCount(12);

    // ✍️ sua vez: 24, depois 36, depois o botão some
    await loadMore.click();
    await expect(cards).toHaveCount(24);

    await loadMore.click();
    await expect(cards).toHaveCount(36);

    await expect(loadMore).toBeHidden();
   // void loadMore;

    //falta('B1 — complete a paginação');
  });

  // ── B2 🟡 · ≈ 7 min ────────────────────────────────────────────────────────
  // 📚 Aprende: pressSequentially (digitar tecla a tecla, como gente), seletor CSS
  //    por PREFIXO  page.locator('[data-testid^="search-result-"]')  e toHaveValue.
  // 🧩 Na tela /search:
  //    1. digite "matrix" tecla a tecla (pressSequentially, delay ~80ms), como um usuário. A busca tem *debounce*:
  //       só dispara 250ms depois da última tecla — e o expect espera isso sozinho
  //    2. exatamente 1 resultado aparece (use o seletor por prefixo) e ele contém "Matrix"
  //    3. clique em "Limpar": o input volta vazio e os resultados somem (0)
  //    4. digite "xyzw": aparece o estado vazio (search-empty) mencionando "xyzw"
  // 🆘 Dica: não precisa de nenhum sleep — cada expect já espera sozinho.
  test('B2. busca com debounce: digita devagar, limpa, e o vazio', async ({ page }) => {
    await page.goto('/search');

    const input = page.getByTestId('search-input');
    const results = page.locator('[data-testid^="search-result-"]');

    const clear = page.getByTestId('search-clear-button');
    
    // ✍️ sua vez: 4 passos da busca, com pressSequentially e seletor por prefixo
    await input.pressSequentially('matrix', { delay: 80 });
    await expect(results).toHaveCount(1);
    await expect(results).toContainText('Matrix');

    await page.getByRole('button', { name: 'Limpar' }).click();
    await expect(input).toHaveValue('');
    await expect(results).toHaveCount(0);

    await input.pressSequentially('xyzw', { delay: 80 });

    await expect(page.getByTestId('search-empty')).toContainText('xyzw'); 


    //alta('B2 — escreva os 4 passos');
  });

  // ── B3 🔴 · ≈ 12 min ───────────────────────────────────────────────────────
  // 📚 Aprende: expect.poll (esperar um valor que NÃO é elemento de tela, ex.:
  //    localStorage) e expect.soft (não parar no 1º erro — junta todos os erros).
  // 🧩 Escreva o teste inteiro:
  //    • em /qa, favorite 3 filmes clicando nos corações: Matrix (603), Pulp Fiction (680)
  //      e Clube da Luta (550) — NESSA ordem
  //    • com expect.poll leia  localStorage['cinefav-favorites']  (JSON) e espere
  //      ficar igual a [603, 680, 550]
  //    • recarregue a página (reload) e, com expect.soft, confira que os 3 corações
  //      continuam aria-pressed="true" e que um filme que você NÃO favoritou (Forrest
  //      Gump, id 13) está "false"
  // 🆘 Dicas:
  //    1) await page.evaluate(() => JSON.parse(localStorage.getItem('...') ?? '[]'))
  //    2) await expect.poll(() => <aquilo acima>).toEqual([...])
  //    3) await expect.soft(locator).toHaveAttribute(...)
  test('B3. favoritos persistem: expect.poll no localStorage + soft após reload', async ({ page }) => {
    await page.goto('/qa');
    const btnMatrix = page.getByTestId('movie-card-heart-603');
    const btnPulp = page.getByTestId('movie-card-heart-680');
    const btnFight = page.getByTestId('movie-card-heart-550');
    //const forrestHeart = page.getByTestId('movie-card-heart-13');

    // ✍️ sua vez: favorite os 3 filmes, espere o localStorage, recarregue e confira
    await btnMatrix.click();
    await btnPulp.click();
    await btnFight.click();    
    
    await expect.poll(async () => {
      return await page.evaluate(() => JSON.parse(localStorage.getItem('cinefav-favorites') ?? '[]'));
    }).toEqual([603, 680, 550]);

    await page.reload();  
    await expect.soft(btnMatrix).toHaveAttribute('aria-pressed', 'true');
    await expect.soft(btnPulp).toHaveAttribute('aria-pressed', 'true');
    await expect.soft(btnFight).toHaveAttribute('aria-pressed', 'true');

    const forrestHeart = page.getByTestId('movie-card-heart-13');
    await expect.soft(forrestHeart).toHaveAttribute('aria-pressed', 'false');      

   // falta('B3 — escreva o teste inteiro');
  });
});
