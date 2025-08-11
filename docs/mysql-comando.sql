-- Active: 1753483725145@@localhost@3306@dsw
create database if not exists descalifica2;

create user if not exists dsw@'%' identified by 'dsw';
grant all on descalifica2.* to dsw@'%';