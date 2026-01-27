-- Add missing Tally forms so webhooks can match and process submissions
-- If forms already exist (same tallyFormId), do nothing

INSERT INTO "forms" ("id","tallyFormId","title","description","clinicId","isActive","createdAt","updatedAt")
VALUES
  ('0f1d7c5e-4f6b-4f7f-8a31-b5e1e6c6a001', 'pbDM2q', 'Discharge Form', NULL, NULL, TRUE, NOW(), NOW()),
  ('0f1d7c5e-4f6b-4f7f-8a31-b5e1e6c6a002', 'RGDvYj', 'Pre-Surgery Instructions', NULL, NULL, TRUE, NOW(), NOW()),
  ('0f1d7c5e-4f6b-4f7f-8a31-b5e1e6c6a003', 'xXJ4y5', 'Medication Protocol for a Stress-Free Recovery', NULL, NULL, TRUE, NOW(), NOW())
ON CONFLICT ("tallyFormId") DO NOTHING;
