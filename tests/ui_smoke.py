from pathlib import Path
from tempfile import TemporaryDirectory

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    external_requests: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        context = browser.new_context(accept_downloads=True, viewport={"width": 1440, "height": 1000})
        page = context.new_page()
        page.on(
            "request",
            lambda request: external_requests.append(request.url)
            if not request.url.startswith(("file:", "data:", "blob:"))
            else None,
        )
        page.goto((ROOT / "index.html").as_uri())
        page.wait_for_selector(".checklist-row")

        assert page.title() == "AI-Built App Pre-Launch Checklist | React & TypeScript"
        assert page.locator(".checklist-row").count() == 15
        assert page.locator("#product-link").is_hidden()
        assert page.locator("#progress-label").inner_text() == "0 of 15 confirmed"

        page.locator(".checklist-row").nth(0).locator("input[value='confirmed']").check()
        page.locator(".checklist-row").nth(1).locator("input[value='attention']").check()
        assert page.locator("#progress-label").inner_text() == "1 of 15 confirmed"
        assert page.locator("#attention-label").inner_text() == "1 item need work"

        page.reload()
        page.wait_for_selector(".checklist-row")
        assert page.locator("#progress-label").inner_text() == "1 of 15 confirmed"
        assert page.locator("#attention-count").inner_text() == "1"

        sample = context.new_page()
        sample.goto((ROOT / "sample-report.html").as_uri())
        sample.wait_for_selector(".finding")
        assert sample.title() == "Sample AI App Pre-Launch Health Report"
        assert sample.get_by_text("small synthetic test project", exact=False).is_visible()
        assert sample.get_by_text("Raw HTML injection path", exact=True).is_visible()
        assert sample.get_by_text("Back to the interactive checklist", exact=True).is_visible()

        with TemporaryDirectory() as temp_dir:
            with page.expect_download() as download_info:
                page.locator("#download-report").click()
            report_path = Path(temp_dir) / download_info.value.suggested_filename
            download_info.value.save_as(report_path)
            report = report_path.read_text(encoding="utf-8")
            assert "[CONFIRMED] Dependency lockfile is committed" in report
            assert "[NEEDS WORK] Setup and environment requirements are documented" in report

        mobile = context.new_page()
        mobile.set_viewport_size({"width": 390, "height": 844})
        mobile.goto((ROOT / "index.html").as_uri())
        mobile.wait_for_selector(".checklist-row")
        overflow = mobile.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        assert overflow is False
        assert mobile.locator(".status-control").first.is_visible()

        mobile_sample = context.new_page()
        mobile_sample.set_viewport_size({"width": 390, "height": 844})
        mobile_sample.goto((ROOT / "sample-report.html").as_uri())
        mobile_sample.wait_for_selector(".finding")
        sample_overflow = mobile_sample.evaluate(
            "document.documentElement.scrollWidth > document.documentElement.clientWidth"
        )
        assert sample_overflow is False
        assert external_requests == []
        browser.close()


if __name__ == "__main__":
    main()
