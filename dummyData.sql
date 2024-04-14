INSERT INTO "thread" ("user_id", "author", "title", "content", "anonymous")
VALUES 
  ('user123', 'Alice', 'Recommendations for AI Learning Resources', 'Looking for books, courses, and tutorials to master AI. Any suggestions?', FALSE),
  ('user456', 'Bob', 'Understanding Neural Networks', 'Can someone explain neural networks in simple terms?', TRUE),
  ('user789', 'Charlie', 'Ethics in AI Development', 'Important things to consider when building AI systems...', FALSE);

INSERT INTO "comment" ("thread_id", "user_id", "author", "content", "anonymous", "verified")
VALUES
  (1, 'user567', 'David', 'Check out "Artificial Intelligence: A Modern Approach" by Russell and Norvig.', FALSE, TRUE),
  (1, 'user890', 'Emily', 'I also found this YouTube series helpful: ...', TRUE, FALSE),
  (2, 'user123', 'Alice', 'Neural networks are like a layered network of neurons...', FALSE, FALSE);  

INSERT INTO "tag" ("name")
VALUES
  ('AI'),
  ('learning'),
  ('resources'),
  ('neural networks'),
  ('ethics');

INSERT INTO "thread_tag" ("thread_id", "tag_id")
VALUES
  (1, 1), -- AI
  (1, 2), -- learning
  (1, 3), -- resources
  (2, 4), -- neural networks
  (3, 1), -- AI 
  (3, 5); -- ethics 

INSERT INTO "comment_reply" ("comment_id", "user_id", "author", "content", "anonymous")
VALUES 
  (1, 'user678', 'Brian', 'Great point! I also think...', FALSE),
  (1, 'user234', 'Emily', 'Interesting perspective. Thanks for sharing!', FALSE), 
  (3, 'user910', 'Alex', 'I disagree. Here''s why...', TRUE),
  (2, 'user567', 'Sarah', 'Absolutely agree!', FALSE); 

INSERT INTO "report" ("user_id", "thread_id", "comment_id", "comment_reply_id","report_type", "status_review")
VALUES
	('user567', 1, 1, 1, 'spam', FALSE);