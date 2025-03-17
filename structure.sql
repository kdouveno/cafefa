-- Database: cafefa

-- DROP DATABASE IF EXISTS cafefa;

CREATE TABLE IF NOT EXISTS Fields (
	tablename text,
	fieldname text,
	inputType text,
	template text default 'default',
	UNIQUE (tablename, fieldname, template)
);

CREATE TABLE IF NOT EXISTS Images (
	id serial unique primary key,
	title text,
	filename text unique
);

CREATE TABLE IF NOT EXISTS Timetable (
	id serial unique primary key,
	title text,
	timetable jsonb
);

CREATE TABLE IF NOT EXISTS Articles (
	id serial unique primary key,
	title text,
	content text,
	imgid integer references Images(id),
	timetableid integer references Timetable(id),
	startdate date,
	enddate date,
	created_at timestamp default current_timestamp,
	priooffset integer default 0,
	headline interval default '2 weeks',
	visible boolean default true
);

INSERT INTO Fields VALUES ('articles', 'id', 'id') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'title', 'text') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'content', 'textarea') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'imgid', 'system') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'timetableid', 'system') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'startdate', 'datetime-local') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'enddate', 'datetime-local') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'created_at', 'system') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'priooffset', 'number') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'headline', 'number') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('articles', 'visible', 'checkbox') ON CONFLICT DO NOTHING;

INSERT INTO Fields VALUES ('images', 'id', 'id') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('images', 'title', 'text') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('images', 'filename', 'text') ON CONFLICT DO NOTHING;

INSERT INTO Fields VALUES ('timetable', 'id', 'id') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('timetable', 'title', 'text') ON CONFLICT DO NOTHING;
INSERT INTO Fields VALUES ('timetable', 'timetable', 'text') ON CONFLICT DO NOTHING;


