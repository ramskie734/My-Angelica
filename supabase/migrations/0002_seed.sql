-- ============================================================================
-- My Angelica - Sample seed data
-- Run AFTER 0001_schema.sql in the Supabase SQL Editor.
-- Demo subject: Cruise Tourism (matches the examples in the product spec).
-- ============================================================================

-- Subject ---------------------------------------------------------------------
insert into public.subjects (id, title, description, emoji, color, is_published)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Cruise Tourism',
  'An introduction to the cruise industry: the parts of a cruise ship, life on board, types of cruises, and popular destinations around the world.',
  '🚢',
  '#EC4899',
  true
);

insert into public.subjects (id, title, description, emoji, color, is_published)
values (
  'a0000000-0000-0000-0000-000000000002',
  'Introduction to Tourism',
  'Foundations of tourism: definitions, elements of travel, and the tourism system.',
  '🌍',
  '#B79FF7',
  true
);

-- Unit 1 ----------------------------------------------------------------------
insert into public.units (id, subject_id, title, description, order_index)
values (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Unit 1: The Cruise Ship',
  'Learn the ship from the inside out - its parts, its people, and daily life on board.',
  1
);

insert into public.units (id, subject_id, title, description, order_index)
values (
  'b0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Unit 2: Cruise Destinations',
  'Discover the most popular cruise itineraries and what makes each region special.',
  2
);

insert into public.units (id, subject_id, title, description, order_index)
values (
  'b0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000002',
  'Unit 1: Foundations of Tourism',
  'The meaning of tourism, the elements of travel, and how the tourism system works.',
  1
);

-- Lessons ---------------------------------------------------------------------
insert into public.lessons (id, unit_id, title, description, order_index)
values (
  'c0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Lesson 1: The Cruise Ship',
  'The parts of a cruise ship and the people who run it.',
  1
);

insert into public.lessons (id, unit_id, title, description, order_index)
values (
  'c0000000-0000-0000-0000-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'Lesson 2: Types of Cruises',
  'Contemporary, premium, luxury, river, and expedition cruising.',
  2
);

insert into public.lessons (id, unit_id, title, description, order_index)
values (
  'c0000000-0000-0000-0000-000000000003',
  'b0000000-0000-0000-0000-000000000002',
  'Lesson 1: Popular Itineraries',
  'The Caribbean, the Mediterranean, and Alaska.',
  1
);

insert into public.lessons (id, unit_id, title, description, order_index)
values (
  'c0000000-0000-0000-0000-000000000004',
  'b0000000-0000-0000-0000-000000000003',
  'Lesson 1: The Meaning of Tourism',
  'Defining tourism and the elements of travel.',
  1
);

-- Topics ----------------------------------------------------------------------
insert into public.topics (id, lesson_id, title, summary, explanation, teacher_notes, important_reminders, order_index)
values (
  'd0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'Parts of a Cruise Ship',
  'The fifteen most important parts of a cruise ship every tourism student must know.',
  E'A modern cruise ship is a floating resort. To understand how it works, you need to know its major parts.\n\nThe bridge sits high on the ship and serves as the command center where the captain and officers navigate. The bow is the front of the ship and the stern is the rear. When facing forward, the left side is called the port side and the right side is the starboard side.\n\nThe hull is the watery body of the ship that keeps everything afloat. Decks are the floor levels of the ship, and the funnel releases engine exhaust high above the passengers. Cabins are the passenger rooms, from cozy interior staterooms to suites with balconies.\n\nPassengers board through the gangway, and the anchor holds the ship steady when it stops. In an emergency, lifeboats carry everyone to safety. Modern ships also feature the atrium (the grand central lobby), the promenade (the walking area that circles the ship), and the lido deck (the pool and leisure deck).',
  'Memorize port and starboard using this trick: the words "port" and "left" both have four letters. Expect at least one quiz question about the bridge and one enumeration question about the major parts.',
  'Port and starboard never change even if the passenger turns around - they always follow the direction the ship is facing, not the direction the person is facing.',
  1
);

insert into public.topics (id, lesson_id, title, summary, explanation, teacher_notes, important_reminders, order_index)
values (
  'd0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  'Cruise Ship Personnel',
  'Who runs a cruise ship: the captain, the hotel director, the cruise director, and the crew behind the scenes.',
  E'Every cruise ship runs on two parallel teams.\n\nThe deck team is led by the captain, the ship''s master and final authority on board. Deck officers assist with navigation and safety drills, while marine engineers keep the engines and systems running below the waterline.\n\nThe hotel team is led by the hotel director, who manages everything passengers experience: the cabins, the restaurants, the entertainment. The cruise director is the face of the voyage, hosting shows and activities. The executive chef leads the galleys, pursers handle money and guest accounts, and stewards keep every cabin spotless.',
  'The captain handles the ship. The hotel director handles everything the passenger touches. Students often mix these two up - remind them that the cruise director is only in charge of entertainment, never of the whole ship.',
  'In an emergency, the captain''s word overrides every other officer on board.',
  2
);

insert into public.topics (id, lesson_id, title, summary, explanation, teacher_notes, important_reminders, order_index)
values (
  'd0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000002',
  'Contemporary vs Premium vs Luxury Cruises',
  'The three market segments of ocean cruising and what each one promises the guest.',
  E'Cruise lines are grouped into market segments by price, service level, and style.\n\nContemporary cruises (like Carnival and Royal Caribbean) are the most affordable and most popular, built for families and first-time cruisers with water slides, buffets, and megaships.\n\nPremium cruises (like Celebrity and Holland America) offer better dining, more space per guest, and a calmer atmosphere at a higher fare.\n\nLuxury cruises (like Regent and Seabourn) are small ships with butler service, all-inclusive fares, and the highest crew-to-guest ratios in the industry.',
  'Anchor the lesson with crew-to-guest ratio: roughly 1 crew for 3 guests on contemporary ships, and nearly 1:1 on luxury ships.',
  null,
  1
);

insert into public.topics (id, lesson_id, title, summary, explanation, teacher_notes, important_reminders, order_index)
values (
  'd0000000-0000-0000-0000-000000000004',
  'c0000000-0000-0000-0000-000000000003',
  'The Caribbean',
  'The world''s number one cruise region: eastern, western, and southern itineraries.',
  E'The Caribbean is the busiest cruise region on earth, with more than a third of all cruise passengers sailing there.\n\nEastern Caribbean itineraries usually sail from Florida to Puerto Rico, St. Thomas, and St. Maarten. Western Caribbean routes visit Cozumel, Jamaica, and Grand Cayman. Southern Caribbean cruises depart from San Juan and visit the smaller, quieter islands like Aruba and Curaçao.\n\nThe region is busiest from December to April, which is the dry season.',
  'The Caribbean is the classic example of a warm-weather, beach-driven cruise market. Contrast it with Alaska, which sells scenery and wildlife instead.',
  null,
  1
);

insert into public.topics (id, lesson_id, title, summary, explanation, teacher_notes, important_reminders, order_index)
values (
  'd0000000-0000-0000-0000-000000000005',
  'c0000000-0000-0000-0000-000000000004',
  'What is Tourism?',
  'The definition of tourism and the four elements of travel.',
  E'Tourism is the temporary movement of people to places away from their normal home and workplace, the activities they undertake during their stay, and the facilities created to meet their needs.\n\nFour elements must be present for travel to count as tourism: distance (leaving your usual environment), duration (a stay that is temporary), purpose (leisure, business, or visiting friends and relatives), and activity (the experiences pursued during the trip).',
  'A daily commute is NOT tourism - it fails the distance and purpose tests. Use that example to anchor the definition.',
  null,
  1
);

-- Flashcards: Parts of a Cruise Ship (15) --------------------------------------
insert into public.flashcards (topic_id, front, back, order_index) values
('d0000000-0000-0000-0000-000000000001', 'Bridge', 'The command center of the cruise ship where the captain and officers navigate.', 1),
('d0000000-0000-0000-0000-000000000001', 'Bow', 'The front part of the ship.', 2),
('d0000000-0000-0000-0000-000000000001', 'Stern', 'The rear part of the ship.', 3),
('d0000000-0000-0000-0000-000000000001', 'Port', 'The left side of the ship when facing forward.', 4),
('d0000000-0000-0000-0000-000000000001', 'Starboard', 'The right side of the ship when facing forward.', 5),
('d0000000-0000-0000-0000-000000000001', 'Hull', 'The main body of the ship that floats on the water.', 6),
('d0000000-0000-0000-0000-000000000001', 'Deck', 'A floor level of the ship, often open to the outdoors.', 7),
('d0000000-0000-0000-0000-000000000001', 'Funnel', 'The structure that releases engine exhaust smoke high above the ship.', 8),
('d0000000-0000-0000-0000-000000000001', 'Cabin', 'A passenger room on the ship.', 9),
('d0000000-0000-0000-0000-000000000001', 'Gangway', 'The movable ramp used to board and leave the ship.', 10),
('d0000000-0000-0000-0000-000000000001', 'Anchor', 'The heavy device that holds the ship in place at sea.', 11),
('d0000000-0000-0000-0000-000000000001', 'Lifeboat', 'The emergency rescue boat that carries passengers to safety.', 12),
('d0000000-0000-0000-0000-000000000001', 'Atrium', 'The grand central lobby found on modern cruise ships.', 13),
('d0000000-0000-0000-0000-000000000001', 'Promenade', 'The walking area that circles the ship.', 14),
('d0000000-0000-0000-0000-000000000001', 'Lido Deck', 'The pool and leisure deck of the ship.', 15);

-- Flashcards: Cruise Ship Personnel (8) ---------------------------------------
insert into public.flashcards (topic_id, front, back, order_index) values
('d0000000-0000-0000-0000-000000000002', 'Captain', 'The master of the ship and the final authority on board.', 1),
('d0000000-0000-0000-0000-000000000002', 'Hotel Director', 'The officer who manages all passenger experiences: cabins, dining, and service.', 2),
('d0000000-0000-0000-0000-000000000002', 'Cruise Director', 'The host of the voyage who manages entertainment and activities.', 3),
('d0000000-0000-0000-0000-000000000002', 'Executive Chef', 'The head of the galleys and all food preparation on board.', 4),
('d0000000-0000-0000-0000-000000000002', 'Purser', 'The officer who handles money, guest accounts, and front-desk services.', 5),
('d0000000-0000-0000-0000-000000000002', 'Deck Officer', 'The officer who assists the captain with navigation and safety drills.', 6),
('d0000000-0000-0000-0000-000000000002', 'Marine Engineer', 'The crew member who maintains the engines and technical systems below deck.', 7),
('d0000000-0000-0000-0000-000000000002', 'Steward', 'The crew member who cleans and maintains passenger cabins.', 8);

-- Flashcards: Market segments (6) ---------------------------------------------
insert into public.flashcards (topic_id, front, back, order_index) values
('d0000000-0000-0000-0000-000000000003', 'Contemporary cruise', 'The most affordable cruise segment, built for families and first-time cruisers on megaships.', 1),
('d0000000-0000-0000-0000-000000000003', 'Premium cruise', 'A mid-priced segment offering better dining and more space per guest, like Celebrity and Holland America.', 2),
('d0000000-0000-0000-0000-000000000003', 'Luxury cruise', 'Small all-inclusive ships with butler service and near 1:1 crew-to-guest ratios, like Regent and Seabourn.', 3),
('d0000000-0000-0000-0000-000000000003', 'River cruise', 'Smaller ships that sail inland waterways such as the Danube or the Nile.', 4),
('d0000000-0000-0000-0000-000000000003', 'Expedition cruise', 'Adventure cruising to remote regions like Antarctica, led by naturalist guides.', 5),
('d0000000-0000-0000-0000-000000000003', 'Crew-to-guest ratio', 'The number of crew members per guest - the key indicator of service level between segments.', 6);

-- Flashcards: The Caribbean (6) -----------------------------------------------
insert into public.flashcards (topic_id, front, back, order_index) values
('d0000000-0000-0000-0000-000000000004', 'Eastern Caribbean itinerary', 'Routes from Florida to Puerto Rico, St. Thomas, and St. Maarten.', 1),
('d0000000-0000-0000-0000-000000000004', 'Western Caribbean itinerary', 'Routes visiting Cozumel, Jamaica, and Grand Cayman.', 2),
('d0000000-0000-0000-0000-000000000004', 'Southern Caribbean itinerary', 'Routes from San Juan to smaller islands like Aruba and Curaçao.', 3),
('d0000000-0000-0000-0000-000000000004', 'Caribbean peak season', 'December to April - the dry season and the busiest months.', 4),
('d0000000-0000-0000-0000-000000000004', 'Turnaround port', 'A home port where one cruise ends and the next voyage begins the same day.', 5),
('d0000000-0000-0000-0000-000000000004', 'Port of call', 'A scheduled stop where passengers go ashore to explore the destination.', 6);

-- Flashcards: What is Tourism (5) ----------------------------------------------
insert into public.flashcards (topic_id, front, back, order_index) values
('d0000000-0000-0000-0000-000000000005', 'Tourism', 'The temporary movement of people to places away from their normal home, and the activities they undertake during their stay.', 1),
('d0000000-0000-0000-0000-000000000005', 'Distance element', 'Leaving your usual environment - one of the four elements of travel.', 2),
('d0000000-0000-0000-0000-000000000005', 'Duration element', 'The stay must be temporary - one of the four elements of travel.', 3),
('d0000000-0000-0000-0000-000000000005', 'Purpose element', 'The reason for the trip: leisure, business, or visiting friends and relatives.', 4),
('d0000000-0000-0000-0000-000000000005', 'Activity element', 'The experiences pursued during the trip - the fourth element of travel.', 5);

-- Quiz questions: Parts of a Cruise Ship (all six types) -----------------------
insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000001',
  'multiple_choice',
  'Which part of the cruise ship serves as its command center?',
  '["The lido deck", "The bridge", "The atrium", "The funnel"]'::jsonb,
  '"The bridge"'::jsonb,
  1,
  'The bridge is where the captain and officers navigate and command the ship.',
  1
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000001',
  'true_false',
  'The port side of the ship is the right side when facing forward.',
  null,
  'false'::jsonb,
  1,
  'Port is the LEFT side. Starboard is the right side. Remember: both "port" and "left" have four letters.',
  2
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000001',
  'identification',
  'The command center of the cruise ship.',
  null,
  '"bridge"'::jsonb,
  1,
  'The bridge sits high on the ship where the captain and officers navigate.',
  3
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000001',
  'enumeration',
  'Name the four major parts of the cruise ship.',
  null,
  '["bow", "stern", "hull", "deck"]'::jsonb,
  4,
  'The bow (front), stern (rear), hull (body), and decks (floor levels) are the four major parts.',
  4
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000001',
  'matching',
  'Match each part of the ship with what it is.',
  '[{"left":"Bridge","right":"Command center"},{"left":"Cabin","right":"Passenger room"},{"left":"Deck","right":"Outdoor area"},{"left":"Funnel","right":"Exhaust structure"}]'::jsonb,
  '[{"left":"Bridge","right":"Command center"},{"left":"Cabin","right":"Passenger room"},{"left":"Deck","right":"Outdoor area"},{"left":"Funnel","right":"Exhaust structure"}]'::jsonb,
  4,
  'Bridge = command center, cabin = passenger room, deck = outdoor area, funnel = exhaust structure.',
  5
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000001',
  'fill_blank',
  'The ___ is the left side of the ship when facing forward.',
  null,
  '["port"]'::jsonb,
  1,
  'Port is always the left side when facing the bow (front).',
  6
);

-- Quiz questions: Cruise Ship Personnel ----------------------------------------
insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000002',
  'multiple_choice',
  'Who is the final authority on board a cruise ship?',
  '["The hotel director", "The cruise director", "The captain", "The purser"]'::jsonb,
  '"The captain"'::jsonb,
  1,
  'The captain is the master of the ship and the final authority in every situation.',
  1
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000002',
  'matching',
  'Match each officer with their responsibility.',
  '[{"left":"Hotel Director","right":"Passenger experience"},{"left":"Cruise Director","right":"Entertainment"},{"left":"Executive Chef","right":"Food preparation"},{"left":"Purser","right":"Guest accounts"}]'::jsonb,
  '[{"left":"Hotel Director","right":"Passenger experience"},{"left":"Cruise Director","right":"Entertainment"},{"left":"Executive Chef","right":"Food preparation"},{"left":"Purser","right":"Guest accounts"}]'::jsonb,
  4,
  'Hotel director owns the guest experience, cruise director the fun, chef the food, purser the money.',
  2
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000002',
  'identification',
  'The officer who handles money, guest accounts, and front-desk services.',
  null,
  '"purser"'::jsonb,
  1,
  'The purser runs the front desk and guest accounts.',
  3
);

-- Quiz questions: Market segments ----------------------------------------------
insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000003',
  'multiple_choice',
  'Which market segment offers all-inclusive fares with the highest crew-to-guest ratios?',
  '["Contemporary", "Premium", "Luxury", "River"]'::jsonb,
  '"Luxury"'::jsonb,
  1,
  'Luxury lines like Regent and Seabourn are all-inclusive with nearly one crew member per guest.',
  1
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000003',
  'enumeration',
  'Name the three main ocean cruise market segments.',
  null,
  '["contemporary", "premium", "luxury"]'::jsonb,
  3,
  'Contemporary, premium, and luxury are the three main segments.',
  2
);

-- Quiz questions: The Caribbean -------------------------------------------------
insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000004',
  'true_false',
  'The Caribbean cruise season is busiest from December to April.',
  null,
  'true'::jsonb,
  1,
  'December to April is the dry season and the peak of the Caribbean cruise season.',
  1
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000004',
  'fill_blank',
  'A scheduled stop where passengers go ashore is called a ___ of call.',
  null,
  '["port"]'::jsonb,
  1,
  'A port of call is a scheduled stop along the itinerary.',
  2
);

-- Quiz questions: What is Tourism -----------------------------------------------
insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000005',
  'identification',
  'The temporary movement of people to places away from their normal home.',
  null,
  '["tourism"]'::jsonb,
  1,
  'This is the standard definition of tourism.',
  1
);

insert into public.quiz_questions (topic_id, question_type, question, options, answer, points, explanation, order_index)
values (
  'd0000000-0000-0000-0000-000000000005',
  'enumeration',
  'Name the four elements of travel.',
  null,
  '["distance", "duration", "purpose", "activity"]'::jsonb,
  4,
  'Distance, duration, purpose, and activity must all be present for travel to count as tourism.',
  2
);
