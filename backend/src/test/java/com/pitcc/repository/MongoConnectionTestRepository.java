package com.pitcc.repository;

import com.pitcc.model.MongoConnectionTestDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MongoConnectionTestRepository
        extends MongoRepository<MongoConnectionTestDocument, String> {
        }