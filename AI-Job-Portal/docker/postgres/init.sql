-- Creates one database per microservice. Runs automatically the first
-- time the postgres container starts with an empty data volume.
CREATE DATABASE auth_db;
CREATE DATABASE user_db;
CREATE DATABASE job_db;
CREATE DATABASE application_db;
CREATE DATABASE resume_db;
CREATE DATABASE notification_db;
CREATE DATABASE ai_db;
