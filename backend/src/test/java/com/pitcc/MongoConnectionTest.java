package com.pitcc;

import com.pitcc.model.MongoConnectionTestDocument;
import com.pitcc.repository.MongoConnectionTestRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class MongoConnectionTest {

    @Autowired
    private MongoConnectionTestRepository repository;

    @Test
    void shouldSaveAndRetrieveDocument() {
        // Create a new document
        MongoConnectionTestDocument document = new MongoConnectionTestDocument();
        document.setMessage("Hello, MongoDB!");

        // Save the document to the database
        MongoConnectionTestDocument savedDocument = repository.save(document);

        // Retrieve the document from the database
        MongoConnectionTestDocument retrievedDocument = repository.findById(savedDocument.getId()).orElse(null);

        // Assert that the retrieved document is not null and has the expected message
        assertNotNull(retrievedDocument);
        assertEquals("Hello, MongoDB!", retrievedDocument.getMessage());
    }
}