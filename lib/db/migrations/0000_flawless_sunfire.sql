CREATE TYPE "public"."appointment_status" AS ENUM('confirmed', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."exception_type" AS ENUM('holiday', 'vacation', 'course', 'event', 'reduced', 'extended', 'closure', 'other');--> statement-breakpoint
CREATE TABLE "barbershops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo_url" text,
	"phone" varchar(20),
	"address" text,
	"active" boolean DEFAULT true NOT NULL,
	"stripe_customer_id" varchar(255),
	"stripe_subscription_id" varchar(255),
	"stripe_price_id" varchar(255),
	"subscription_status" varchar(50),
	"subscription_start" timestamp with time zone,
	"subscription_end" timestamp with time zone,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "barbershops_owner_id_unique" UNIQUE("owner_id"),
	CONSTRAINT "barbershops_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "barbers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barbershop_id" uuid NOT NULL,
	"user_id" uuid,
	"name" varchar(100) NOT NULL,
	"avatar_url" text,
	"bio" text,
	"specialties" text[],
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "barbers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barbershop_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"duration_minutes" smallint NOT NULL,
	"price" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "services_duration_positive" CHECK ("services"."duration_minutes" > 0),
	CONSTRAINT "services_price_non_negative" CHECK ("services"."price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "barber_services" (
	"barber_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "barber_services_barber_id_service_id_pk" PRIMARY KEY("barber_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "working_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barber_id" uuid NOT NULL,
	"day_of_week" smallint NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"opens_at" time,
	"closes_at" time,
	"break_start" time,
	"break_end" time,
	CONSTRAINT "working_hours_barber_day_unique" UNIQUE("barber_id","day_of_week"),
	CONSTRAINT "working_hours_day_range" CHECK ("working_hours"."day_of_week" BETWEEN 0 AND 6),
	CONSTRAINT "working_hours_active_requires_times" CHECK (
        ("working_hours"."active" = false)
        OR (
          "working_hours"."opens_at"  IS NOT NULL AND
          "working_hours"."closes_at" IS NOT NULL AND
          "working_hours"."closes_at" > "working_hours"."opens_at"
        )
      ),
	CONSTRAINT "working_hours_break_consistency" CHECK (
        ("working_hours"."break_start" IS NULL AND "working_hours"."break_end" IS NULL)
        OR (
          "working_hours"."break_start" IS NOT NULL AND
          "working_hours"."break_end"   IS NOT NULL AND
          "working_hours"."break_end"   > "working_hours"."break_start" AND
          "working_hours"."break_start" >= "working_hours"."opens_at"   AND
          "working_hours"."break_end"   <= "working_hours"."closes_at"
        )
      )
);
--> statement-breakpoint
CREATE TABLE "availability_exceptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barber_id" uuid NOT NULL,
	"date" date NOT NULL,
	"is_available" boolean NOT NULL,
	"opens_at" time,
	"closes_at" time,
	"break_start" time,
	"break_end" time,
	"exception_type" "exception_type" NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "availability_exceptions_barber_date_unique" UNIQUE("barber_id","date"),
	CONSTRAINT "availability_exceptions_available_requires_times" CHECK (
        ("availability_exceptions"."is_available" = false AND "availability_exceptions"."opens_at" IS NULL AND "availability_exceptions"."closes_at" IS NULL)
        OR (
          "availability_exceptions"."is_available" = true  AND
          "availability_exceptions"."opens_at"     IS NOT NULL AND
          "availability_exceptions"."closes_at"    IS NOT NULL AND
          "availability_exceptions"."closes_at"    > "availability_exceptions"."opens_at"
        )
      ),
	CONSTRAINT "availability_exceptions_break_consistency" CHECK (
        ("availability_exceptions"."break_start" IS NULL AND "availability_exceptions"."break_end" IS NULL)
        OR (
          "availability_exceptions"."break_start" IS NOT NULL AND
          "availability_exceptions"."break_end"   IS NOT NULL AND
          "availability_exceptions"."break_end"   > "availability_exceptions"."break_start"
        )
      )
);
--> statement-breakpoint
CREATE TABLE "blocked_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barber_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"reason" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blocked_slots_end_after_start" CHECK ("blocked_slots"."ends_at" > "blocked_slots"."starts_at")
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barbershop_id" uuid NOT NULL,
	"barber_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"client_name" varchar(100) NOT NULL,
	"client_phone" varchar(20) NOT NULL,
	"client_email" varchar(254),
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'confirmed' NOT NULL,
	"price_charged" integer NOT NULL,
	"notes" text,
	"cancelled_by" uuid,
	"cancelled_at" timestamp with time zone,
	"cancellation_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "appointments_end_after_start" CHECK ("appointments"."ends_at" > "appointments"."starts_at"),
	CONSTRAINT "appointments_price_non_negative" CHECK ("appointments"."price_charged" >= 0),
	CONSTRAINT "appointments_cancellation_consistency" CHECK (
        ("appointments"."cancelled_by" IS NULL AND "appointments"."cancelled_at" IS NULL)
        OR
        ("appointments"."cancelled_by" IS NOT NULL AND "appointments"."cancelled_at" IS NOT NULL)
      )
);
--> statement-breakpoint
ALTER TABLE "barbers" ADD CONSTRAINT "barbers_barbershop_id_barbershops_id_fk" FOREIGN KEY ("barbershop_id") REFERENCES "public"."barbershops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_barbershop_id_barbershops_id_fk" FOREIGN KEY ("barbershop_id") REFERENCES "public"."barbershops"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_exceptions" ADD CONSTRAINT "availability_exceptions_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_slots" ADD CONSTRAINT "blocked_slots_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barbershop_id_barbershops_id_fk" FOREIGN KEY ("barbershop_id") REFERENCES "public"."barbershops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_barber_id_barbers_id_fk" FOREIGN KEY ("barber_id") REFERENCES "public"."barbers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;