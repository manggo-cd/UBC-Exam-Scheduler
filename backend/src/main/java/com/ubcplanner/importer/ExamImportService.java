package com.ubcplanner.importer;

import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ExamImportService {

  @Value("${ubc.exams.baseUrl}")
  private String baseUrl;

  // For now, just fetch the entry page to prove connectivity.
  public String fetchEntry(String subject, String course, String term) throws Exception {
    String q = (subject + " " + course).trim();

    Connection conn = Jsoup.connect(baseUrl)
        .userAgent("UBC-Exam-Scheduler/1.0 (+https://github.com/manggo-cd/UBC-Exam-Scheduler)")
        .referrer("https://students.ubc.ca/")
        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
        .header("Accept-Language", "en-CA,en;q=0.9")
        .timeout(15_000)
        .followRedirects(true);

    String html = conn.get().outerHtml();
    int len = html != null ? html.length() : 0;

    // Next step: locate the real search request and parse results into Exam rows.
    return "Fetched " + len + " bytes from " + baseUrl + " for query='" + q + "', term='" + term + "'";
  }
}
