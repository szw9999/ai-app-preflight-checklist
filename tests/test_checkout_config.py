import unittest

from scripts.configure_checkout import render_site_config_js, validate_checkout_url


class CheckoutConfigTests(unittest.TestCase):
    def test_accepts_public_https_checkout_url(self) -> None:
        url = "https://example.lemonsqueezy.com/buy/example"
        self.assertEqual(validate_checkout_url(url), url)

    def test_rejects_unsafe_checkout_urls(self) -> None:
        for url in (
            "http://example.com/buy/example",
            "https://localhost/buy/example",
            "https://127.0.0.1/buy/example",
            "https://user:password@example.com/buy/example",
            "https://example.com/buy/example#fragment",
        ):
            with self.subTest(url=url):
                with self.assertRaises(ValueError):
                    validate_checkout_url(url)

    def test_renders_browser_config_from_structured_data(self) -> None:
        data = {
            "checkoutUrl": "https://example.com/buy/example",
            "productName": "Example",
            "priceLabel": "USD 19",
        }
        rendered = render_site_config_js(data)
        self.assertIn('"checkoutUrl": "https://example.com/buy/example"', rendered)
        self.assertTrue(rendered.startswith("window.PREFLIGHT_SITE_CONFIG = Object.freeze("))
        self.assertTrue(rendered.endswith(");\n"))


if __name__ == "__main__":
    unittest.main()

