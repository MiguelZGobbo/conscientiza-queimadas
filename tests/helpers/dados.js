// Exercita a interface visível; o select nativo é somente a alternativa progressiva.
export async function chooseState(page, uf) {
  if (!uf) {
    await page.locator('#state-select').evaluate(select => {
      select.value = '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    return;
  }
  await page.locator('#state-combobox').click();
  await page.locator(`#state-options [data-value="${uf}"]`).click();
}
