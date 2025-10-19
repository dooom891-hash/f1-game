from playwright.sync_api import sync_playwright, expect
import os

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto(f"file://{os.getcwd()}/index.html")

    # Click the start button
    page.get_by_role("button", name="Start Game").click()

    # Expect the canvas to be visible, with a longer timeout
    expect(page.locator("#game-canvas")).to_be_visible(timeout=10000)

    # Give the 3D scene time to render before taking the screenshot
    page.wait_for_timeout(1000)

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/verification.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
