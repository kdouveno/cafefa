-- Database: brainstorm

-- DROP DATABASE IF EXISTS brainstorm;

CREATE TABLE IF NOT EXISTS Articles (
	nb serial primary key,
	title text,
	content text,
	imgpath text,
	startdate date,
	enddate date,
	timetable text -- json
);