import unittest
from urllib.parse import parse_qs, urlparse

from scripts.submit_indexnow import build_submission_url, validate_submission_config


class IndexNowSubmissionTests(unittest.TestCase):
    def test_builds_encoded_submission_with_key_location(self) -> None:
        result = build_submission_url(
            "https://szw9999.github.io/ai-app-preflight-checklist/",
            "abcd1234",
            "https://szw9999.github.io/ai-app-preflight-checklist/abcd1234.txt",
        )
        parsed = urlparse(result)
        query = parse_qs(parsed.query)
        self.assertEqual(parsed.netloc, "api.indexnow.org")
        self.assertEqual(query["url"], ["https://szw9999.github.io/ai-app-preflight-checklist/"])
        self.assertEqual(query["key"], ["abcd1234"])
        self.assertEqual(
            query["keyLocation"],
            ["https://szw9999.github.io/ai-app-preflight-checklist/abcd1234.txt"],
        )

    def test_requires_key_file_to_cover_submitted_url_path(self) -> None:
        with self.assertRaises(ValueError):
            validate_submission_config(
                "https://szw9999.github.io/other-project/",
                "abcd1234",
                "https://szw9999.github.io/ai-app-preflight-checklist/abcd1234.txt",
            )


if __name__ == "__main__":
    unittest.main()

