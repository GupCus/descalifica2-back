-- Active: 1753572744257@@127.0.0.1@3306@descalifica2
create database if not exists descalifica2;

create user if not exists dsw@'%' identified by 'dsw';
grant all on descalifica2.* to dsw@'%';