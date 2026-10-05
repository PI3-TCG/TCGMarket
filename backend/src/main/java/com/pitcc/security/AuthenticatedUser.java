package com.pitcc.security;

import com.pitcc.model.UserRole;

public record AuthenticatedUser(String id, UserRole role) {}
