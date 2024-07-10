CREATE EXTENSION IF NOT EXISTS vector;

CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;
	
CREATE SEQUENCE public.images_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START 1
	CACHE 1
	NO CYCLE;


CREATE TABLE public."USERS" (
	id int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
	username varchar NOT NULL,
	"password" varchar NOT NULL
);

CREATE TABLE public."IMAGES" (
	id int4 NOT NULL DEFAULT nextval('images_id_seq'::regclass),
	"path" varchar NOT NULL,
	user_id int4 NOT NULL,
	embedding vector(1024) NOT NULL 
);
