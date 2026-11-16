--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_departmentId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_toUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_toDeptId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_toAreaId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_fromUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_fromDeptId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_fromAreaId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_creatorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_confirmerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_assetId_fkey";
ALTER TABLE IF EXISTS ONLY public."Asset" DROP CONSTRAINT IF EXISTS "Asset_groupId_fkey";
ALTER TABLE IF EXISTS ONLY public."Asset" DROP CONSTRAINT IF EXISTS "Asset_categoryId_fkey";
ALTER TABLE IF EXISTS ONLY public."Asset" DROP CONSTRAINT IF EXISTS "Asset_assignedUserId_fkey";
ALTER TABLE IF EXISTS ONLY public."Asset" DROP CONSTRAINT IF EXISTS "Asset_assignedDeptId_fkey";
ALTER TABLE IF EXISTS ONLY public."Asset" DROP CONSTRAINT IF EXISTS "Asset_areaId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssetHistory" DROP CONSTRAINT IF EXISTS "AssetHistory_assetId_fkey";
ALTER TABLE IF EXISTS ONLY public."AssetHistory" DROP CONSTRAINT IF EXISTS "AssetHistory_actorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Area" DROP CONSTRAINT IF EXISTS "Area_facilityId_fkey";
DROP INDEX IF EXISTS public."User_username_key";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."Ticket_ticketCode_key";
DROP INDEX IF EXISTS public."Facility_name_key";
DROP INDEX IF EXISTS public."Department_name_key";
DROP INDEX IF EXISTS public."Category_name_key";
DROP INDEX IF EXISTS public."Asset_assetCode_key";
DROP INDEX IF EXISTS public."AssetGroup_code_key";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."Ticket" DROP CONSTRAINT IF EXISTS "Ticket_pkey";
ALTER TABLE IF EXISTS ONLY public."Facility" DROP CONSTRAINT IF EXISTS "Facility_pkey";
ALTER TABLE IF EXISTS ONLY public."Department" DROP CONSTRAINT IF EXISTS "Department_pkey";
ALTER TABLE IF EXISTS ONLY public."Category" DROP CONSTRAINT IF EXISTS "Category_pkey";
ALTER TABLE IF EXISTS ONLY public."Asset" DROP CONSTRAINT IF EXISTS "Asset_pkey";
ALTER TABLE IF EXISTS ONLY public."AssetHistory" DROP CONSTRAINT IF EXISTS "AssetHistory_pkey";
ALTER TABLE IF EXISTS ONLY public."AssetGroup" DROP CONSTRAINT IF EXISTS "AssetGroup_pkey";
ALTER TABLE IF EXISTS ONLY public."Area" DROP CONSTRAINT IF EXISTS "Area_pkey";
ALTER TABLE IF EXISTS public."Category" ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Ticket";
DROP TABLE IF EXISTS public."Facility";
DROP TABLE IF EXISTS public."Department";
DROP SEQUENCE IF EXISTS public."Category_id_seq";
DROP TABLE IF EXISTS public."Category";
DROP TABLE IF EXISTS public."AssetHistory";
DROP TABLE IF EXISTS public."AssetGroup";
DROP TABLE IF EXISTS public."Asset";
DROP TABLE IF EXISTS public."Area";
DROP TYPE IF EXISTS public."TicketType";
DROP TYPE IF EXISTS public."TicketStatus";
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."ManagementStatus";
DROP TYPE IF EXISTS public."AssetCondition";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AssetCondition; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AssetCondition" AS ENUM (
    'GOOD',
    'NEEDS_INSPECTION',
    'BROKEN'
);


--
-- Name: ManagementStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ManagementStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'INACTIVE'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'MANAGER',
    'USER',
    'INVENTORY_CHECKER'
);


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'DRAFT',
    'CONFIRMED',
    'CANCELLED'
);


--
-- Name: TicketType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketType" AS ENUM (
    'HANDOVER',
    'TRANSFER',
    'RECALL',
    'DEACTIVATE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Area" (
    id text NOT NULL,
    name text NOT NULL,
    "facilityId" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: Asset; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Asset" (
    id text NOT NULL,
    "assetCode" text NOT NULL,
    name text NOT NULL,
    "groupId" text NOT NULL,
    "areaId" text NOT NULL,
    "categoryId" integer NOT NULL,
    "assignedUserId" text,
    "assignedDeptId" text,
    "managementStatus" public."ManagementStatus" DEFAULT 'AVAILABLE'::public."ManagementStatus" NOT NULL,
    condition public."AssetCondition" DEFAULT 'GOOD'::public."AssetCondition" NOT NULL,
    model text,
    serial text,
    brand text,
    image text,
    notes text,
    "receiptDate" timestamp(3) without time zone,
    "warrantyDate" timestamp(3) without time zone,
    "purchaseValue" numeric(65,30) DEFAULT 0,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: AssetGroup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AssetGroup" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: AssetHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AssetHistory" (
    id text NOT NULL,
    "assetId" text NOT NULL,
    action text NOT NULL,
    reason text,
    "beforeState" jsonb,
    "afterState" jsonb,
    "actorId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Department; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Department" (
    id text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: Facility; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Facility" (
    id text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- Name: Ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Ticket" (
    id text NOT NULL,
    "ticketCode" text NOT NULL,
    type public."TicketType" NOT NULL,
    status public."TicketStatus" DEFAULT 'DRAFT'::public."TicketStatus" NOT NULL,
    "assetId" text NOT NULL,
    "fromAreaId" text,
    "fromUserId" text,
    "fromDeptId" text,
    "fromStatus" public."ManagementStatus",
    "toAreaId" text,
    "toUserId" text,
    "toDeptId" text,
    "toStatus" public."ManagementStatus",
    reason text NOT NULL,
    "creatorId" text NOT NULL,
    "confirmerId" text,
    "confirmedAt" timestamp(3) without time zone,
    "referenceTicketId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    "fullName" text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "departmentId" text,
    email text NOT NULL
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Data for Name: Area; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Area" VALUES ('11111111-1111-4111-8111-111111111101', 'Tầng 3 (Phòng Dev)', 'ab611cb9-017f-43d5-b674-c6dc70abe103', true);
INSERT INTO public."Area" VALUES ('11111111-1111-4111-8111-111111111102', 'Tầng 2 (Phòng Họp A)', 'ab611cb9-017f-43d5-b674-c6dc70abe103', true);
INSERT INTO public."Area" VALUES ('11111111-1111-4111-8111-111111111103', 'Tầng 4 (Khu làm việc)', 'ab611cb9-017f-43d5-b674-c6dc70abe103', true);
INSERT INTO public."Area" VALUES ('11111111-1111-4111-8111-111111111104', 'Kho thiết bị trung tâm', 'ab611cb9-017f-43d5-b674-c6dc70abe103', true);


--
-- Data for Name: Asset; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Asset" VALUES ('e3ffe6cb-f89c-4f76-b4fc-ce2a90d3587f', 'AST-001', 'Laptop Dell Latitude 5420 #1', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111102', 4, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'GOOD', 'Latitude 5420', 'SN-2026-0001', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-01 17:00:00', '2028-02-01 17:00:00', 5250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.356', '2026-11-16 09:55:01.356');
INSERT INTO public."Asset" VALUES ('32271765-c7f8-406e-82ec-572983fa9de3', 'AST-002', 'Laptop Lenovo ThinkPad T14 #2', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'AVAILABLE', 'GOOD', 'ThinkPad T14 Gen 3', 'SN-2026-0002', 'Lenovo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-02 17:00:00', '2028-03-02 17:00:00', 5500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.362', '2026-11-16 09:55:01.362');
INSERT INTO public."Asset" VALUES ('211f9616-0df1-4084-b113-f7ba95e973ee', 'AST-003', 'MacBook Pro 14 inch M2 #3', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111104', 3, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'NEEDS_INSPECTION', 'MacBook Pro M2 2023', 'SN-2026-0003', 'Apple', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-03 17:00:00', '2028-04-03 17:00:00', 5750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.363', '2026-11-16 09:55:01.363');
INSERT INTO public."Asset" VALUES ('b00b43c9-c850-45ff-8926-c2bdd7d0745e', 'AST-004', 'Màn hình ViewSonic 27 inch #4', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'INACTIVE', 'BROKEN', 'VA2732-H', 'SN-2026-0004', 'ViewSonic', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-04 17:00:00', '2028-05-04 17:00:00', 6000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.364', '2026-11-16 09:55:01.364');
INSERT INTO public."Asset" VALUES ('503f79b1-ba4b-4752-b98e-af604095d401', 'AST-005', 'Màn hình Dell UltraSharp 24" #5', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'AVAILABLE', 'GOOD', 'U2422H', 'SN-2026-0005', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-05 17:00:00', '2028-06-05 17:00:00', 6250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.365', '2026-11-16 09:55:01.365');
INSERT INTO public."Asset" VALUES ('d9e178d1-cfd3-434a-ad6f-2c6c3648e5e5', 'AST-006', 'Ghế công thái học Ergonomic #6', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111103', 2, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'GOOD', 'M57 Pro', 'SN-2026-0006', 'Sihoo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-06 17:00:00', '2028-01-06 17:00:00', 6500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.367', '2026-11-16 09:55:01.367');
INSERT INTO public."Asset" VALUES ('09164e75-cb0a-4c4d-b941-1d2c9445f274', 'AST-007', 'Bàn làm việc thông minh nâng hạ #7', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'AVAILABLE', 'GOOD', 'SmartDesk Pro', 'SN-2026-0007', 'Epione', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-07 17:00:00', '2028-02-07 17:00:00', 6750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.369', '2026-11-16 09:55:01.369');
INSERT INTO public."Asset" VALUES ('9692fa17-8b1a-44cd-85e5-1ecbc51ee843', 'AST-008', 'Máy chiếu Epson EB-FH06 #8', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111101', 1, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'NEEDS_INSPECTION', 'EB-FH06 Full HD', 'SN-2026-0008', 'Epson', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-08 17:00:00', '2028-03-08 17:00:00', 7000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.37', '2026-11-16 09:55:01.37');
INSERT INTO public."Asset" VALUES ('c693779a-1bc7-446c-9783-e28d85767be2', 'AST-009', 'Loa hội nghị Jabra Speak 510 #9', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'INACTIVE', 'BROKEN', 'Speak 510 MS', 'SN-2026-0009', 'Jabra', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-09 17:00:00', '2028-04-09 17:00:00', 7250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.371', '2026-11-16 09:55:01.371');
INSERT INTO public."Asset" VALUES ('9137025d-572b-4a8a-97d2-6827dabe1ca6', 'AST-010', 'Ổ cứng di động SSD Samsung T7 1TB #10', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'AVAILABLE', 'GOOD', 'MU-PC1T0T', 'SN-2026-0010', 'Samsung', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-10 17:00:00', '2028-05-10 17:00:00', 7500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.372', '2026-11-16 09:55:01.372');
INSERT INTO public."Asset" VALUES ('455c4580-bb43-44ae-b50b-66e8bd6bc076', 'AST-011', 'Bộ phát Wi-Fi Aruba AP-305 #11', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111104', 3, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'GOOD', 'AP-305', 'SN-2026-0011', 'HP Aruba', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-11 17:00:00', '2028-06-11 17:00:00', 7750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.373', '2026-11-16 09:55:01.373');
INSERT INTO public."Asset" VALUES ('fdeb5298-1daa-4b22-99aa-3953b57a7d22', 'AST-012', 'Bàn phím cơ Keychron K2 #12', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'AVAILABLE', 'GOOD', 'K2 V2 Hot-swappable', 'SN-2026-0012', 'Keychron', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-12 17:00:00', '2028-01-12 17:00:00', 8000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.374', '2026-11-16 09:55:01.374');
INSERT INTO public."Asset" VALUES ('ec576dae-e3f3-493d-80fc-1c995b6229be', 'AST-013', 'Chuột không dây Logitech MX Master 3S #13', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111102', 4, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'NEEDS_INSPECTION', 'MX Master 3S', 'SN-2026-0013', 'Logitech', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-13 17:00:00', '2028-02-13 17:00:00', 8250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.375', '2026-11-16 09:55:01.375');
INSERT INTO public."Asset" VALUES ('c1a53058-585b-41a6-baf2-c377fe05e0c7', 'AST-014', 'Tai nghe chống ồn Sony WH-1000XM4 #14', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'INACTIVE', 'BROKEN', 'WH-1000XM4', 'SN-2026-0014', 'Sony', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-14 17:00:00', '2028-03-14 17:00:00', 8500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.377', '2026-11-16 09:55:01.377');
INSERT INTO public."Asset" VALUES ('c325831d-aaa4-4273-9212-80e2f887400c', 'AST-015', 'Máy in laser đa chức năng Canon #15', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'AVAILABLE', 'GOOD', 'MF244dw', 'SN-2026-0015', 'Canon', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-15 17:00:00', '2028-04-15 17:00:00', 8750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.378', '2026-11-16 09:55:01.378');
INSERT INTO public."Asset" VALUES ('b54243a5-257e-4f5e-8491-7ac59dd935b9', 'AST-016', 'Laptop Dell Latitude 5420 #16', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111101', 1, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'GOOD', 'Latitude 5420', 'SN-2026-0016', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-16 17:00:00', '2028-05-16 17:00:00', 9000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.379', '2026-11-16 09:55:01.379');
INSERT INTO public."Asset" VALUES ('8d18d4a3-77d1-45e6-b06e-dc5f5d4627ca', 'AST-017', 'Laptop Lenovo ThinkPad T14 #17', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'AVAILABLE', 'GOOD', 'ThinkPad T14 Gen 3', 'SN-2026-0017', 'Lenovo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-17 17:00:00', '2028-06-17 17:00:00', 9250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.38', '2026-11-16 09:55:01.38');
INSERT INTO public."Asset" VALUES ('4d900fcd-0559-4d68-b492-534fdec245e9', 'AST-018', 'MacBook Pro 14 inch M2 #18', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111103', 2, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'NEEDS_INSPECTION', 'MacBook Pro M2 2023', 'SN-2026-0018', 'Apple', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-18 17:00:00', '2028-01-18 17:00:00', 9500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.381', '2026-11-16 09:55:01.381');
INSERT INTO public."Asset" VALUES ('1cfe13d0-dfc3-436e-a71e-03dafec53814', 'AST-019', 'Màn hình ViewSonic 27 inch #19', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'INACTIVE', 'BROKEN', 'VA2732-H', 'SN-2026-0019', 'ViewSonic', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-19 17:00:00', '2028-02-19 17:00:00', 9750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.382', '2026-11-16 09:55:01.382');
INSERT INTO public."Asset" VALUES ('7acec68f-6327-4d59-ae89-e97afda8d1db', 'AST-020', 'Màn hình Dell UltraSharp 24" #20', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'AVAILABLE', 'GOOD', 'U2422H', 'SN-2026-0020', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-20 17:00:00', '2028-03-20 17:00:00', 10000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.383', '2026-11-16 09:55:01.383');
INSERT INTO public."Asset" VALUES ('746c1f09-e208-44f6-8b64-990b1ab7a6c5', 'AST-021', 'Ghế công thái học Ergonomic #21', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111102', 4, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'GOOD', 'M57 Pro', 'SN-2026-0021', 'Sihoo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-21 17:00:00', '2028-04-21 17:00:00', 10250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.385', '2026-11-16 09:55:01.385');
INSERT INTO public."Asset" VALUES ('ea87e91d-d9f5-436c-a0da-0920370013d8', 'AST-022', 'Bàn làm việc thông minh nâng hạ #22', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'AVAILABLE', 'GOOD', 'SmartDesk Pro', 'SN-2026-0022', 'Epione', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-22 17:00:00', '2028-05-22 17:00:00', 10500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.386', '2026-11-16 09:55:01.386');
INSERT INTO public."Asset" VALUES ('58405862-2054-44d5-8838-b130b16cc0f1', 'AST-023', 'Máy chiếu Epson EB-FH06 #23', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111104', 3, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'NEEDS_INSPECTION', 'EB-FH06 Full HD', 'SN-2026-0023', 'Epson', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-23 17:00:00', '2028-06-23 17:00:00', 10750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.387', '2026-11-16 09:55:01.387');
INSERT INTO public."Asset" VALUES ('4ef2038f-9f0c-46bc-9262-25e5de832cb7', 'AST-024', 'Loa hội nghị Jabra Speak 510 #24', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'INACTIVE', 'BROKEN', 'Speak 510 MS', 'SN-2026-0024', 'Jabra', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-24 17:00:00', '2028-01-24 17:00:00', 11000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.388', '2026-11-16 09:55:01.388');
INSERT INTO public."Asset" VALUES ('331dc425-96d0-472b-a98f-d92648a6c41d', 'AST-025', 'Ổ cứng di động SSD Samsung T7 1TB #25', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'AVAILABLE', 'GOOD', 'MU-PC1T0T', 'SN-2026-0025', 'Samsung', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-31 17:00:00', '2028-01-31 17:00:00', 11250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.389', '2026-11-16 09:55:01.389');
INSERT INTO public."Asset" VALUES ('f527ddbf-cf27-4049-abc5-3f360e984e6c', 'AST-026', 'Bộ phát Wi-Fi Aruba AP-305 #26', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111103', 2, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'GOOD', 'AP-305', 'SN-2026-0026', 'HP Aruba', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-01 17:00:00', '2028-03-01 17:00:00', 11500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.39', '2026-11-16 09:55:01.39');
INSERT INTO public."Asset" VALUES ('0e18da95-7a3f-4cd9-acdc-98d0a0043174', 'AST-027', 'Bàn phím cơ Keychron K2 #27', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'AVAILABLE', 'GOOD', 'K2 V2 Hot-swappable', 'SN-2026-0027', 'Keychron', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-02 17:00:00', '2028-04-02 17:00:00', 11750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.391', '2026-11-16 09:55:01.391');
INSERT INTO public."Asset" VALUES ('729c47ac-632d-47c5-9aa9-a6d06ccfdff5', 'AST-028', 'Chuột không dây Logitech MX Master 3S #28', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111101', 1, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'NEEDS_INSPECTION', 'MX Master 3S', 'SN-2026-0028', 'Logitech', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-03 17:00:00', '2028-05-03 17:00:00', 12000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.392', '2026-11-16 09:55:01.392');
INSERT INTO public."Asset" VALUES ('de0b912c-fb2c-478b-9e53-af61d6603077', 'AST-029', 'Tai nghe chống ồn Sony WH-1000XM4 #29', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'INACTIVE', 'BROKEN', 'WH-1000XM4', 'SN-2026-0029', 'Sony', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-04 17:00:00', '2028-06-04 17:00:00', 12250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.393', '2026-11-16 09:55:01.393');
INSERT INTO public."Asset" VALUES ('10e12a8f-bdc9-49f2-9612-9702e1958c79', 'AST-030', 'Máy in laser đa chức năng Canon #30', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'AVAILABLE', 'GOOD', 'MF244dw', 'SN-2026-0030', 'Canon', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-05 17:00:00', '2028-01-05 17:00:00', 12500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.394', '2026-11-16 09:55:01.394');
INSERT INTO public."Asset" VALUES ('3c2ba7c6-ebbd-47ef-ae18-47c80a85b81f', 'AST-031', 'Laptop Dell Latitude 5420 #31', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111104', 3, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'GOOD', 'Latitude 5420', 'SN-2026-0031', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-06 17:00:00', '2028-02-06 17:00:00', 12750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.395', '2026-11-16 09:55:01.395');
INSERT INTO public."Asset" VALUES ('c7b8e4d5-36b5-4b87-a6d8-f35cf4065eb2', 'AST-032', 'Laptop Lenovo ThinkPad T14 #32', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'AVAILABLE', 'GOOD', 'ThinkPad T14 Gen 3', 'SN-2026-0032', 'Lenovo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-07 17:00:00', '2028-03-07 17:00:00', 13000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.396', '2026-11-16 09:55:01.396');
INSERT INTO public."Asset" VALUES ('08e30fe8-1b82-427a-9ba7-6bde3a856861', 'AST-033', 'MacBook Pro 14 inch M2 #33', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111102', 4, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'NEEDS_INSPECTION', 'MacBook Pro M2 2023', 'SN-2026-0033', 'Apple', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-08 17:00:00', '2028-04-08 17:00:00', 13250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.398', '2026-11-16 09:55:01.398');
INSERT INTO public."Asset" VALUES ('cc66c74c-315e-4399-bc51-81fc7fd5393f', 'AST-034', 'Màn hình ViewSonic 27 inch #34', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'INACTIVE', 'BROKEN', 'VA2732-H', 'SN-2026-0034', 'ViewSonic', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-09 17:00:00', '2028-05-09 17:00:00', 13500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.399', '2026-11-16 09:55:01.399');
INSERT INTO public."Asset" VALUES ('917474a2-3697-4322-9fdd-71ace3fb946b', 'AST-035', 'Màn hình Dell UltraSharp 24" #35', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'AVAILABLE', 'GOOD', 'U2422H', 'SN-2026-0035', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-10 17:00:00', '2028-06-10 17:00:00', 13750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.4', '2026-11-16 09:55:01.4');
INSERT INTO public."Asset" VALUES ('4e547213-32b8-4323-b1e9-60570a9b41ef', 'AST-036', 'Ghế công thái học Ergonomic #36', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111101', 1, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'GOOD', 'M57 Pro', 'SN-2026-0036', 'Sihoo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-11 17:00:00', '2028-01-11 17:00:00', 14000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.401', '2026-11-16 09:55:01.401');
INSERT INTO public."Asset" VALUES ('a3b336d8-62ac-4fb4-83b5-977c2988a8aa', 'AST-037', 'Bàn làm việc thông minh nâng hạ #37', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'AVAILABLE', 'GOOD', 'SmartDesk Pro', 'SN-2026-0037', 'Epione', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-12 17:00:00', '2028-02-12 17:00:00', 14250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.402', '2026-11-16 09:55:01.402');
INSERT INTO public."Asset" VALUES ('23317628-3302-494a-9acb-a6ebcd0315d0', 'AST-038', 'Máy chiếu Epson EB-FH06 #38', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111103', 2, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'NEEDS_INSPECTION', 'EB-FH06 Full HD', 'SN-2026-0038', 'Epson', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-13 17:00:00', '2028-03-13 17:00:00', 14500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.403', '2026-11-16 09:55:01.403');
INSERT INTO public."Asset" VALUES ('a8d6d356-17c3-49d6-86ab-42a918625fb4', 'AST-039', 'Loa hội nghị Jabra Speak 510 #39', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'INACTIVE', 'BROKEN', 'Speak 510 MS', 'SN-2026-0039', 'Jabra', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-14 17:00:00', '2028-04-14 17:00:00', 14750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.404', '2026-11-16 09:55:01.404');
INSERT INTO public."Asset" VALUES ('6f6cba15-e425-4c2b-a302-d5dd5707a1df', 'AST-040', 'Ổ cứng di động SSD Samsung T7 1TB #40', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'AVAILABLE', 'GOOD', 'MU-PC1T0T', 'SN-2026-0040', 'Samsung', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-15 17:00:00', '2028-05-15 17:00:00', 15000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.405', '2026-11-16 09:55:01.405');
INSERT INTO public."Asset" VALUES ('987b2f17-b860-4dc2-a156-6b0e75a8a869', 'AST-041', 'Bộ phát Wi-Fi Aruba AP-305 #41', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111102', 4, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'GOOD', 'AP-305', 'SN-2026-0041', 'HP Aruba', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-16 17:00:00', '2028-06-16 17:00:00', 15250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.406', '2026-11-16 09:55:01.406');
INSERT INTO public."Asset" VALUES ('bc5b3c91-8f62-4496-8f6a-1a7b239369fe', 'AST-042', 'Bàn phím cơ Keychron K2 #42', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'AVAILABLE', 'GOOD', 'K2 V2 Hot-swappable', 'SN-2026-0042', 'Keychron', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-17 17:00:00', '2028-01-17 17:00:00', 15500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.407', '2026-11-16 09:55:01.407');
INSERT INTO public."Asset" VALUES ('d597f84e-a9e5-4e08-b5fb-9bf94f2f0e4e', 'AST-043', 'Chuột không dây Logitech MX Master 3S #43', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111104', 3, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'NEEDS_INSPECTION', 'MX Master 3S', 'SN-2026-0043', 'Logitech', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-18 17:00:00', '2028-02-18 17:00:00', 15750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.408', '2026-11-16 09:55:01.408');
INSERT INTO public."Asset" VALUES ('c17137bd-5558-44a9-b531-ae3b94518171', 'AST-044', 'Tai nghe chống ồn Sony WH-1000XM4 #44', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'INACTIVE', 'BROKEN', 'WH-1000XM4', 'SN-2026-0044', 'Sony', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-19 17:00:00', '2028-03-19 17:00:00', 16000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.409', '2026-11-16 09:55:01.409');
INSERT INTO public."Asset" VALUES ('74ff68cb-5106-45eb-adca-8d500451e152', 'AST-045', 'Máy in laser đa chức năng Canon #45', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'AVAILABLE', 'GOOD', 'MF244dw', 'SN-2026-0045', 'Canon', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-20 17:00:00', '2028-04-20 17:00:00', 16250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.41', '2026-11-16 09:55:01.41');
INSERT INTO public."Asset" VALUES ('c8e4990c-ad1e-46ce-8e28-527e126bf95b', 'AST-046', 'Laptop Dell Latitude 5420 #46', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111103', 2, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'GOOD', 'Latitude 5420', 'SN-2026-0046', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-21 17:00:00', '2028-05-21 17:00:00', 16500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.411', '2026-11-16 09:55:01.411');
INSERT INTO public."Asset" VALUES ('651eaff8-da68-4ead-9eb8-74568574117d', 'AST-047', 'Laptop Lenovo ThinkPad T14 #47', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'AVAILABLE', 'GOOD', 'ThinkPad T14 Gen 3', 'SN-2026-0047', 'Lenovo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-22 17:00:00', '2028-06-22 17:00:00', 16750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.412', '2026-11-16 09:55:01.412');
INSERT INTO public."Asset" VALUES ('c1a28850-9b5c-4552-bb58-82745edf153e', 'AST-048', 'MacBook Pro 14 inch M2 #48', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111101', 1, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'NEEDS_INSPECTION', 'MacBook Pro M2 2023', 'SN-2026-0048', 'Apple', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-23 17:00:00', '2028-01-23 17:00:00', 17000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.413', '2026-11-16 09:55:01.413');
INSERT INTO public."Asset" VALUES ('be2c1bdb-77a2-4f0b-92ab-0d063e26f1ab', 'AST-049', 'Màn hình ViewSonic 27 inch #49', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'INACTIVE', 'BROKEN', 'VA2732-H', 'SN-2026-0049', 'ViewSonic', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-24 17:00:00', '2028-02-24 17:00:00', 17250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.414', '2026-11-16 09:55:01.414');
INSERT INTO public."Asset" VALUES ('829ab0ff-d81b-4928-8f8e-064af770fef8', 'AST-050', 'Màn hình Dell UltraSharp 24" #50', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'AVAILABLE', 'GOOD', 'U2422H', 'SN-2026-0050', 'Dell', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-28 17:00:00', '2028-02-29 17:00:00', 17500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.415', '2026-11-16 09:55:01.415');
INSERT INTO public."Asset" VALUES ('8baa3b44-9afd-4f3c-95c7-eb0eaffcce5f', 'AST-051', 'Ghế công thái học Ergonomic #51', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111104', 3, 'a7bb1099-74b2-4570-ad68-d643f61180fc', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'IN_USE', 'GOOD', 'M57 Pro', 'SN-2026-0051', 'Sihoo', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-01 17:00:00', '2028-04-01 17:00:00', 17750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.416', '2026-11-16 09:55:01.416');
INSERT INTO public."Asset" VALUES ('fe0fd538-5145-4237-a1a3-1776da899236', 'AST-052', 'Bàn làm việc thông minh nâng hạ #52', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'AVAILABLE', 'GOOD', 'SmartDesk Pro', 'SN-2026-0052', 'Epione', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-02 17:00:00', '2028-05-02 17:00:00', 18000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.417', '2026-11-16 09:55:01.417');
INSERT INTO public."Asset" VALUES ('f52c0c68-67c9-4517-832a-a880d610d34d', 'AST-053', 'Máy chiếu Epson EB-FH06 #53', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111102', 4, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'NEEDS_INSPECTION', 'EB-FH06 Full HD', 'SN-2026-0053', 'Epson', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-03 17:00:00', '2028-06-03 17:00:00', 18250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.418', '2026-11-16 09:55:01.418');
INSERT INTO public."Asset" VALUES ('ec72fdf0-c678-407c-b81a-d251a417e8c6', 'AST-054', 'Loa hội nghị Jabra Speak 510 #54', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111103', 2, NULL, NULL, 'INACTIVE', 'BROKEN', 'Speak 510 MS', 'SN-2026-0054', 'Jabra', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-04 17:00:00', '2028-01-04 17:00:00', 18500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.42', '2026-11-16 09:55:01.42');
INSERT INTO public."Asset" VALUES ('217d4403-413b-46f8-917a-6a5cf67c9cf7', 'AST-055', 'Ổ cứng di động SSD Samsung T7 1TB #55', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'AVAILABLE', 'GOOD', 'MU-PC1T0T', 'SN-2026-0055', 'Samsung', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-02-05 17:00:00', '2028-02-05 17:00:00', 18750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.421', '2026-11-16 09:55:01.421');
INSERT INTO public."Asset" VALUES ('e88a3576-0c17-4337-8310-98d01db5f869', 'AST-056', 'Bộ phát Wi-Fi Aruba AP-305 #56', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111101', 1, 'b36abb60-e4f7-4813-a35d-bb522954d728', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'IN_USE', 'GOOD', 'AP-305', 'SN-2026-0056', 'HP Aruba', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-03-06 17:00:00', '2028-03-06 17:00:00', 19000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.422', '2026-11-16 09:55:01.422');
INSERT INTO public."Asset" VALUES ('f22af1c3-d6a2-4807-b890-fde87dc33057', 'AST-057', 'Bàn phím cơ Keychron K2 #57', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111102', 4, NULL, NULL, 'AVAILABLE', 'GOOD', 'K2 V2 Hot-swappable', 'SN-2026-0057', 'Keychron', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-04-07 17:00:00', '2028-04-07 17:00:00', 19250000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.423', '2026-11-16 09:55:01.423');
INSERT INTO public."Asset" VALUES ('0e881a49-d092-410b-a4f0-cf0f582829dd', 'AST-058', 'Chuột không dây Logitech MX Master 3S #58', '11f36efb-1952-45b2-aa9b-65951109c5bf', '11111111-1111-4111-8111-111111111103', 2, 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'IN_USE', 'NEEDS_INSPECTION', 'MX Master 3S', 'SN-2026-0058', 'Logitech', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-05-08 17:00:00', '2028-05-08 17:00:00', 19500000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.424', '2026-11-16 09:55:01.424');
INSERT INTO public."Asset" VALUES ('31a8a249-82ca-4831-b998-ade590b632d9', 'AST-059', 'Tai nghe chống ồn Sony WH-1000XM4 #59', 'ae9903c5-9378-4358-a600-2ab441e6c380', '11111111-1111-4111-8111-111111111104', 3, NULL, NULL, 'INACTIVE', 'BROKEN', 'WH-1000XM4', 'SN-2026-0059', 'Sony', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-06-09 17:00:00', '2028-06-09 17:00:00', 19750000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.425', '2026-11-16 09:55:01.425');
INSERT INTO public."Asset" VALUES ('f66031a8-6d06-4cbf-8463-4e95f5dfb7e9', 'AST-060', 'Máy in laser đa chức năng Canon #60', '5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', '11111111-1111-4111-8111-111111111101', 1, NULL, NULL, 'AVAILABLE', 'GOOD', 'MF244dw', 'SN-2026-0060', 'Canon', NULL, 'Tài sản khởi tạo trong danh mục thiết bị công ty', '2026-01-10 17:00:00', '2028-01-10 17:00:00', 20000000.000000000000000000000000000000, 1, '2026-11-16 09:55:01.426', '2026-11-16 09:55:01.426');


--
-- Data for Name: AssetGroup; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AssetGroup" VALUES ('ae9903c5-9378-4358-a600-2ab441e6c380', 'G-MEET', 'Nhóm thiết bị hội họp', true);
INSERT INTO public."AssetGroup" VALUES ('11f36efb-1952-45b2-aa9b-65951109c5bf', 'G-OFF', 'Nhóm nội thất văn phòng', true);
INSERT INTO public."AssetGroup" VALUES ('5869fa2a-2cd7-4a8a-a6c1-b0b7eda711ea', 'G-IT', 'Nhóm thiết bị CNTT', true);


--
-- Data for Name: AssetHistory; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."AssetHistory" VALUES ('0c17f199-8419-41da-94d4-0d04ddaf6dcc', 'e3ffe6cb-f89c-4f76-b4fc-ce2a90d3587f', 'HOÀN THÀNH PHIẾU: HANDOVER', 'Bàn giao thiết bị làm việc cho nhân sự mới nhận việc', '{"ticketCode": "TCK-20261101-101", "assignedUserId": null, "managementStatus": "AVAILABLE"}', '{"ticketCode": "TCK-20261101-101", "assignedUserId": "a271f2c5-a180-4802-8c68-0a4f0bc4df73", "managementStatus": "IN_USE"}', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.433');
INSERT INTO public."AssetHistory" VALUES ('26ef93d0-1f80-4ad1-85a2-2264e0944bb8', '211f9616-0df1-4084-b113-f7ba95e973ee', 'HOÀN THÀNH PHIẾU: TRANSFER', 'Điều chuyển thiết bị phục vụ dự án quý IV', '{"ticketCode": "TCK-20261105-102", "assignedUserId": "a7bb1099-74b2-4570-ad68-d643f61180fc", "managementStatus": "IN_USE"}', '{"ticketCode": "TCK-20261105-102", "assignedUserId": "a7bb1099-74b2-4570-ad68-d643f61180fc", "managementStatus": "IN_USE"}', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.437');
INSERT INTO public."AssetHistory" VALUES ('09063890-76ef-4e56-8f31-545a3da8c51e', '32271765-c7f8-406e-82ec-572983fa9de3', 'HOÀN THÀNH PHIẾU: RECALL', 'Thu hồi thiết bị về kho sau khi kết thúc đợt công tác', '{"ticketCode": "TCK-20261110-103", "assignedUserId": "a271f2c5-a180-4802-8c68-0a4f0bc4df73", "managementStatus": "IN_USE"}', '{"ticketCode": "TCK-20261110-103", "assignedUserId": null, "managementStatus": "AVAILABLE"}', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.438');
INSERT INTO public."AssetHistory" VALUES ('da4aa87b-700b-4dc3-8ba5-e92b15f35644', '503f79b1-ba4b-4752-b98e-af604095d401', 'TẠO PHIẾU: HANDOVER', 'Cấp phát bổ sung màn hình làm việc cho Trần Văn Sử Dụng', '{"ticketCode": "TCK-20261115-104", "ticketStatus": "DRAFT", "managementStatus": "AVAILABLE"}', '{"toUserId": "a7bb1099-74b2-4570-ad68-d643f61180fc", "ticketCode": "TCK-20261115-104", "ticketStatus": "DRAFT", "expectedStatus": "IN_USE"}', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.441');
INSERT INTO public."AssetHistory" VALUES ('0e80d270-2365-4f58-aa45-574117ef6f75', 'd9e178d1-cfd3-434a-ad6f-2c6c3648e5e5', 'TẠO PHIẾU: RECALL', 'Thu hồi thiết bị để bảo dưỡng định kỳ tại kho trung tâm', '{"ticketCode": "TCK-20261115-105", "ticketStatus": "DRAFT", "managementStatus": "IN_USE"}', '{"ticketCode": "TCK-20261115-105", "ticketStatus": "DRAFT", "expectedStatus": "AVAILABLE"}', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.443');
INSERT INTO public."AssetHistory" VALUES ('b414ceab-6949-4c00-8958-08ee78269dc9', '09164e75-cb0a-4c4d-b941-1d2c9445f274', 'HỦY PHIẾU: HANDOVER', 'Hủy phiếu TCK-20261112-106 (Phiếu tạo nhầm thiết bị, đã hủy theo yêu cầu bộ phận)', '{"ticketCode": "TCK-20261112-106", "ticketStatus": "DRAFT"}', '{"ticketCode": "TCK-20261112-106", "ticketStatus": "CANCELLED"}', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.444');


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Category" VALUES (1, 'Thiết bị IT', 'Danh mục chuyên dụng cho Thiết bị IT', '2026-11-16 09:55:01.337');
INSERT INTO public."Category" VALUES (2, 'Thiết bị phòng họp', 'Danh mục chuyên dụng cho Thiết bị phòng họp', '2026-11-16 09:55:01.337');
INSERT INTO public."Category" VALUES (3, 'Công cụ dụng cụ', 'Danh mục chuyên dụng cho Công cụ dụng cụ', '2026-11-16 09:55:01.337');
INSERT INTO public."Category" VALUES (4, 'Nội thất văn phòng', 'Danh mục chuyên dụng cho Nội thất văn phòng', '2026-11-16 09:55:01.337');


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Department" VALUES ('7e5820ca-a1b7-4a78-b4b6-b10fd8c47ef9', 'Phòng Hành Chính - Nhân Sự', true);
INSERT INTO public."Department" VALUES ('3ceb2c02-0308-457d-a408-2712fcb15f55', 'Phòng Kỹ Thuật - CNTT', true);
INSERT INTO public."Department" VALUES ('e1c705ca-eede-4414-9daa-894d5e475edc', 'Phòng Tài Chính - Kế Toán', true);
INSERT INTO public."Department" VALUES ('f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'Phòng Vận Hành & Bảo Trì', true);


--
-- Data for Name: Facility; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Facility" VALUES ('ab611cb9-017f-43d5-b674-c6dc70abe103', 'Cơ sở chính Hà Nội', true);


--
-- Data for Name: Ticket; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Ticket" VALUES ('0ea780ce-4548-41de-93b7-9ed0fadfd856', 'TCK-20261101-101', 'HANDOVER', 'CONFIRMED', 'e3ffe6cb-f89c-4f76-b4fc-ce2a90d3587f', '11111111-1111-4111-8111-111111111104', NULL, NULL, 'AVAILABLE', '11111111-1111-4111-8111-111111111102', 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', NULL, 'IN_USE', 'Bàn giao thiết bị làm việc cho nhân sự mới nhận việc', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.43', NULL, '2026-11-16 09:55:01.431', '2026-11-16 09:55:01.431');
INSERT INTO public."Ticket" VALUES ('8f940fd2-9539-4860-b0db-e26b7eb0d75c', 'TCK-20261105-102', 'TRANSFER', 'CONFIRMED', '211f9616-0df1-4084-b113-f7ba95e973ee', '11111111-1111-4111-8111-111111111101', 'a7bb1099-74b2-4570-ad68-d643f61180fc', NULL, 'IN_USE', '11111111-1111-4111-8111-111111111104', 'a7bb1099-74b2-4570-ad68-d643f61180fc', NULL, 'IN_USE', 'Điều chuyển thiết bị phục vụ dự án quý IV', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.434', NULL, '2026-11-16 09:55:01.435', '2026-11-16 09:55:01.435');
INSERT INTO public."Ticket" VALUES ('463e8046-ef0f-4aa0-81b7-3fc05b047b0a', 'TCK-20261110-103', 'RECALL', 'CONFIRMED', '32271765-c7f8-406e-82ec-572983fa9de3', '11111111-1111-4111-8111-111111111101', 'a271f2c5-a180-4802-8c68-0a4f0bc4df73', NULL, 'IN_USE', '11111111-1111-4111-8111-111111111103', NULL, NULL, 'AVAILABLE', 'Thu hồi thiết bị về kho sau khi kết thúc đợt công tác', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '2026-11-16 09:55:01.437', NULL, '2026-11-16 09:55:01.438', '2026-11-16 09:55:01.438');
INSERT INTO public."Ticket" VALUES ('d663d7ef-f333-45b7-ba23-367cebd22f6e', 'TCK-20261115-104', 'HANDOVER', 'DRAFT', '503f79b1-ba4b-4752-b98e-af604095d401', '11111111-1111-4111-8111-111111111102', NULL, NULL, 'AVAILABLE', '11111111-1111-4111-8111-111111111101', 'a7bb1099-74b2-4570-ad68-d643f61180fc', NULL, 'IN_USE', 'Cấp phát bổ sung màn hình làm việc cho Trần Văn Sử Dụng', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', NULL, NULL, NULL, '2026-11-16 09:55:01.439', '2026-11-16 09:55:01.439');
INSERT INTO public."Ticket" VALUES ('43ab2176-0305-4c8c-901d-e395645b2992', 'TCK-20261115-105', 'RECALL', 'DRAFT', 'd9e178d1-cfd3-434a-ad6f-2c6c3648e5e5', '11111111-1111-4111-8111-111111111103', 'a7bb1099-74b2-4570-ad68-d643f61180fc', NULL, 'IN_USE', '11111111-1111-4111-8111-111111111104', NULL, NULL, 'AVAILABLE', 'Thu hồi thiết bị để bảo dưỡng định kỳ tại kho trung tâm', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', NULL, NULL, NULL, '2026-11-16 09:55:01.441', '2026-11-16 09:55:01.441');
INSERT INTO public."Ticket" VALUES ('b8840724-40d6-4080-9607-1fe55211bdc1', 'TCK-20261112-106', 'HANDOVER', 'CANCELLED', '09164e75-cb0a-4c4d-b941-1d2c9445f274', '11111111-1111-4111-8111-111111111104', NULL, NULL, 'AVAILABLE', '11111111-1111-4111-8111-111111111103', 'b36abb60-e4f7-4813-a35d-bb522954d728', NULL, 'IN_USE', 'Phiếu tạo nhầm thiết bị, đã hủy theo yêu cầu bộ phận', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', '99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', NULL, NULL, '2026-11-16 09:55:01.443', '2026-11-16 09:55:01.443');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('99eb7ae2-cdc9-411b-aab6-7ff90bbe1694', 'manager', '$2b$10$1DYfS1dDN740NGibjMGkbeNcPYOd022mdtWR05jT/gzQvc8kIK3Km', 'Nguyễn Văn Quản Lý', 'MANAGER', '7e5820ca-a1b7-4a78-b4b6-b10fd8c47ef9', 'manager@example.com');
INSERT INTO public."User" VALUES ('a7bb1099-74b2-4570-ad68-d643f61180fc', 'user1', '$2b$10$1DYfS1dDN740NGibjMGkbeNcPYOd022mdtWR05jT/gzQvc8kIK3Km', 'Trần Văn Sử Dụng', 'USER', '3ceb2c02-0308-457d-a408-2712fcb15f55', 'user1@example.com');
INSERT INTO public."User" VALUES ('a271f2c5-a180-4802-8c68-0a4f0bc4df73', 'user2', '$2b$10$1DYfS1dDN740NGibjMGkbeNcPYOd022mdtWR05jT/gzQvc8kIK3Km', 'Phạm Thị Hoa', 'USER', 'e1c705ca-eede-4414-9daa-894d5e475edc', 'user2@example.com');
INSERT INTO public."User" VALUES ('b36abb60-e4f7-4813-a35d-bb522954d728', 'user3', '$2b$10$1DYfS1dDN740NGibjMGkbeNcPYOd022mdtWR05jT/gzQvc8kIK3Km', 'Hoàng Văn Nam', 'USER', 'f810e1a0-a5ee-45d0-8ad4-d87ab47258d2', 'user3@example.com');


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('68933ec3-09cc-4df9-81b6-e35ab5e8a4cc', 'b762d8cc05ff946c1ddbbeb8d5a3f47e1ff098f7ca66f10830d1c55faacaa245', '2026-11-16 16:54:57.793805+07', '20261028020024_add_asset_category_tables', NULL, NULL, '2026-11-16 16:54:57.689962+07', 1);
INSERT INTO public._prisma_migrations VALUES ('21d76b56-a3b3-4d01-9cb0-b89889f9fbb8', '7611f216038281c9f3d72369e80f8f734ec691d314b7c47a2e9887d59e0dfe22', '2026-11-16 16:54:57.82797+07', '20261111031759_fix_sql', NULL, NULL, '2026-11-16 16:54:57.821916+07', 1);


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Category_id_seq"', 4, true);


--
-- Name: Area Area_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_pkey" PRIMARY KEY (id);


--
-- Name: AssetGroup AssetGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssetGroup"
    ADD CONSTRAINT "AssetGroup_pkey" PRIMARY KEY (id);


--
-- Name: AssetHistory AssetHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssetHistory"
    ADD CONSTRAINT "AssetHistory_pkey" PRIMARY KEY (id);


--
-- Name: Asset Asset_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Department Department_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);


--
-- Name: Facility Facility_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Facility"
    ADD CONSTRAINT "Facility_pkey" PRIMARY KEY (id);


--
-- Name: Ticket Ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: AssetGroup_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "AssetGroup_code_key" ON public."AssetGroup" USING btree (code);


--
-- Name: Asset_assetCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Asset_assetCode_key" ON public."Asset" USING btree ("assetCode");


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Department_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Department_name_key" ON public."Department" USING btree (name);


--
-- Name: Facility_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Facility_name_key" ON public."Facility" USING btree (name);


--
-- Name: Ticket_ticketCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Ticket_ticketCode_key" ON public."Ticket" USING btree ("ticketCode");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Area Area_facilityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Area"
    ADD CONSTRAINT "Area_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES public."Facility"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AssetHistory AssetHistory_actorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssetHistory"
    ADD CONSTRAINT "AssetHistory_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: AssetHistory AssetHistory_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AssetHistory"
    ADD CONSTRAINT "AssetHistory_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."Asset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Asset Asset_areaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Asset Asset_assignedDeptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_assignedDeptId_fkey" FOREIGN KEY ("assignedDeptId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Asset Asset_assignedUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Asset Asset_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Asset Asset_groupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Asset"
    ADD CONSTRAINT "Asset_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES public."AssetGroup"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_assetId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES public."Asset"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_confirmerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_confirmerId_fkey" FOREIGN KEY ("confirmerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_creatorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Ticket Ticket_fromAreaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_fromAreaId_fkey" FOREIGN KEY ("fromAreaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_fromDeptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_fromDeptId_fkey" FOREIGN KEY ("fromDeptId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_fromUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_toAreaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_toAreaId_fkey" FOREIGN KEY ("toAreaId") REFERENCES public."Area"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_toDeptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_toDeptId_fkey" FOREIGN KEY ("toDeptId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Ticket Ticket_toUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Ticket"
    ADD CONSTRAINT "Ticket_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: User User_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--


