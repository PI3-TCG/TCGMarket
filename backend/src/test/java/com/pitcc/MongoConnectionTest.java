package com.pitcc;

import com.pitcc.model.MongoConnectionTestDocument;
import com.pitcc.repository.MongoConnectionTestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MongoConnectionTest {

    @Autowired
    private MongoConnectionTestRepository repository;

    @Test
    void shouldSaveAndRetrieveDocument() {
        MongoConnectionTestDocument document = new MongoConnectionTestDocument();
        document.setMessage("Hello, MongoDB!");

        MongoConnectionTestDocument savedDocument = repository.save(document);

        try {
            MongoConnectionTestDocument retrievedDocument =
                    repository.findById(savedDocument.getId()).orElse(null);

            assertNotNull(retrievedDocument);
            assertEquals("Hello, MongoDB!", retrievedDocument.getMessage());
        } finally {
            repository.deleteById(savedDocument.getId());
        }
    }
}