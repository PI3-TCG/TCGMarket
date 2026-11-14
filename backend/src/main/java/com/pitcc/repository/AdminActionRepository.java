package com.pitcc.repository;

import com.pitcc.model.AdminAction;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface AdminActionRepository extends MongoRepository<AdminAction, String> {

  List<AdminAction> findByTargetIdOrderByCreatedAtDesc(String targetId, Pageable pageable);

  List<AdminAction> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
