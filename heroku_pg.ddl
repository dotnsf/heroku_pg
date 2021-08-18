/* heroku_pg.ddl */

/* items */
drop table items;
create table if not exists items ( id varchar(50) not null primary key, image_id varchar(50) not null, name text default null, price int default 0, created bigint default 0, updated bigint default 0 );

/* images */
drop table images;
create table if not exists images ( id varchar(50) not null primary key, body bytea, contenttype varchar(50) default '', filename varchar(256) default '', created bigint default 0, updated bigint default 0 );
