-- Database: brainstorm

-- DROP DATABASE IF EXISTS brainstorm;

CREATE TABLE IF NOT EXISTS Articles (
	nb serial primary key,
	title text,
	content text,
	imgid integer references Images(nb),
	timetableid integer references Timetable(nb),
	startdate date,
	enddate date,
	created_at timestamp default current_timestamp,
	priooffset integer default 0,
	headline interval default '2 weeks',
	visible boolean default true
);

CREATE TABLE IF NOT EXISTS Images (
	nb serial primary key,
	title text,
	filename text unique
);
CREATE TABLE IF NOT EXISTS Timetable (
	nb serial primary key,
	title text,
	timetable jsonb
);

