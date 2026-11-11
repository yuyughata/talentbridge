// Supabase-generated database types for the talentbridge project.
// Regenerate with: npm run db:types  (supabase gen types typescript).
// Do not edit by hand.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string;
          actor_user_id: string | null;
          created_at: string;
          entity_id: string | null;
          entity_type: string;
          id: string;
          ip_address: unknown;
          metadata: Json;
        };
        Insert: {
          action: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type: string;
          id?: string;
          ip_address?: unknown;
          metadata?: Json;
        };
        Update: {
          action?: string;
          actor_user_id?: string | null;
          created_at?: string;
          entity_id?: string | null;
          entity_type?: string;
          id?: string;
          ip_address?: unknown;
          metadata?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey";
            columns: ["actor_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      curriculum_templates: {
        Row: {
          academy_id: string | null;
          age_band: Database["public"]["Enums"]["age_band"];
          created_at: string;
          created_by: string | null;
          focus_summary: string | null;
          id: string;
          is_global: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          academy_id?: string | null;
          age_band: Database["public"]["Enums"]["age_band"];
          created_at?: string;
          created_by?: string | null;
          focus_summary?: string | null;
          id?: string;
          is_global?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          academy_id?: string | null;
          age_band?: Database["public"]["Enums"]["age_band"];
          created_at?: string;
          created_by?: string | null;
          focus_summary?: string | null;
          id?: string;
          is_global?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "curriculum_templates_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "curriculum_templates_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      development_goals: {
        Row: {
          action: string | null;
          attribute: string;
          baseline: string | null;
          coach_comment: string | null;
          created_at: string;
          due_date: string | null;
          id: string;
          owner: string | null;
          plan_id: string;
          player_reflection: string | null;
          status: Database["public"]["Enums"]["goal_status"];
          target: string | null;
          updated_at: string;
        };
        Insert: {
          action?: string | null;
          attribute: string;
          baseline?: string | null;
          coach_comment?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          owner?: string | null;
          plan_id: string;
          player_reflection?: string | null;
          status?: Database["public"]["Enums"]["goal_status"];
          target?: string | null;
          updated_at?: string;
        };
        Update: {
          action?: string | null;
          attribute?: string;
          baseline?: string | null;
          coach_comment?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          owner?: string | null;
          plan_id?: string;
          player_reflection?: string | null;
          status?: Database["public"]["Enums"]["goal_status"];
          target?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "development_goals_owner_fkey";
            columns: ["owner"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "development_goals_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "development_plans";
            referencedColumns: ["id"];
          },
        ];
      };
      development_plans: {
        Row: {
          academy_id: string | null;
          baseline_note: string | null;
          created_at: string;
          created_by: string | null;
          id: string;
          player_id: string;
          review_date: string | null;
          status: Database["public"]["Enums"]["plan_status"];
          title: string | null;
          updated_at: string;
        };
        Insert: {
          academy_id?: string | null;
          baseline_note?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          player_id: string;
          review_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          academy_id?: string | null;
          baseline_note?: string | null;
          created_at?: string;
          created_by?: string | null;
          id?: string;
          player_id?: string;
          review_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "development_plans_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "development_plans_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "development_plans_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      development_reviews: {
        Row: {
          created_at: string;
          cycle_label: string | null;
          decision_trend: string | null;
          id: string;
          next_cycle_focus: string | null;
          plan_id: string;
          player_id: string;
          review_date: string | null;
          reviewer_user_id: string | null;
          speed_trend: string | null;
          summary: string | null;
          tactical_trend: string | null;
          technical_trend: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          cycle_label?: string | null;
          decision_trend?: string | null;
          id?: string;
          next_cycle_focus?: string | null;
          plan_id: string;
          player_id: string;
          review_date?: string | null;
          reviewer_user_id?: string | null;
          speed_trend?: string | null;
          summary?: string | null;
          tactical_trend?: string | null;
          technical_trend?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          cycle_label?: string | null;
          decision_trend?: string | null;
          id?: string;
          next_cycle_focus?: string | null;
          plan_id?: string;
          player_id?: string;
          review_date?: string | null;
          reviewer_user_id?: string | null;
          speed_trend?: string | null;
          summary?: string | null;
          tactical_trend?: string | null;
          technical_trend?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "development_reviews_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "development_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "development_reviews_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "development_reviews_reviewer_user_id_fkey";
            columns: ["reviewer_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          message: string | null;
          organisation_id: string | null;
          role: Database["public"]["Enums"]["app_role"];
          status: Database["public"]["Enums"]["invitation_status"];
          token: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          message?: string | null;
          organisation_id?: string | null;
          role: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["invitation_status"];
          token: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          accepted_by?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          message?: string | null;
          organisation_id?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          status?: Database["public"]["Enums"]["invitation_status"];
          token?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_accepted_by_fkey";
            columns: ["accepted_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invitations_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      matches: {
        Row: {
          away_team: string | null;
          away_team_org_id: string | null;
          competition: string | null;
          created_at: string;
          created_by: string | null;
          home_team: string | null;
          home_team_org_id: string | null;
          id: string;
          match_date: string | null;
          source_reference: string | null;
          updated_at: string;
          venue: string | null;
        };
        Insert: {
          away_team?: string | null;
          away_team_org_id?: string | null;
          competition?: string | null;
          created_at?: string;
          created_by?: string | null;
          home_team?: string | null;
          home_team_org_id?: string | null;
          id?: string;
          match_date?: string | null;
          source_reference?: string | null;
          updated_at?: string;
          venue?: string | null;
        };
        Update: {
          away_team?: string | null;
          away_team_org_id?: string | null;
          competition?: string | null;
          created_at?: string;
          created_by?: string | null;
          home_team?: string | null;
          home_team_org_id?: string | null;
          id?: string;
          match_date?: string | null;
          source_reference?: string | null;
          updated_at?: string;
          venue?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "matches_away_team_org_id_fkey";
            columns: ["away_team_org_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_home_team_org_id_fkey";
            columns: ["home_team_org_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          asset_reference: string;
          consent_id: string | null;
          created_at: string;
          id: string;
          kind: string;
          match_id: string | null;
          player_id: string | null;
          processing_status: Database["public"]["Enums"]["media_processing_status"];
          storage_provider: string;
          title: string | null;
          updated_at: string;
          uploaded_by: string | null;
          visibility: Database["public"]["Enums"]["media_visibility"];
        };
        Insert: {
          asset_reference: string;
          consent_id?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          match_id?: string | null;
          player_id?: string | null;
          processing_status?: Database["public"]["Enums"]["media_processing_status"];
          storage_provider: string;
          title?: string | null;
          updated_at?: string;
          uploaded_by?: string | null;
          visibility?: Database["public"]["Enums"]["media_visibility"];
        };
        Update: {
          asset_reference?: string;
          consent_id?: string | null;
          created_at?: string;
          id?: string;
          kind?: string;
          match_id?: string | null;
          player_id?: string | null;
          processing_status?: Database["public"]["Enums"]["media_processing_status"];
          storage_provider?: string;
          title?: string | null;
          updated_at?: string;
          uploaded_by?: string | null;
          visibility?: Database["public"]["Enums"]["media_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "media_assets_consent_id_fkey";
            columns: ["consent_id"];
            isOneToOne: false;
            referencedRelation: "player_consents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "media_assets_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          link: string | null;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          link?: string | null;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      organisation_members: {
        Row: {
          created_at: string;
          id: string;
          invited_by: string | null;
          job_title: string | null;
          membership_status: string;
          organisation_id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          job_title?: string | null;
          membership_status?: string;
          organisation_id: string;
          role: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          invited_by?: string | null;
          job_title?: string | null;
          membership_status?: string;
          organisation_id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organisation_members_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_members_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organisation_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      organisations: {
        Row: {
          city: string | null;
          country: string | null;
          created_at: string;
          id: string;
          name: string;
          type: Database["public"]["Enums"]["organisation_type"];
          updated_at: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
          verified_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          type: Database["public"]["Enums"]["organisation_type"];
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          type?: Database["public"]["Enums"]["organisation_type"];
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
          verified_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "organisations_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      player_club_history: {
        Row: {
          club_name: string | null;
          created_at: string;
          evidence_note: string | null;
          from_date: string | null;
          id: string;
          level: string | null;
          organisation_id: string | null;
          player_id: string;
          to_date: string | null;
          updated_at: string;
          verification_status: Database["public"]["Enums"]["verification_status"];
        };
        Insert: {
          club_name?: string | null;
          created_at?: string;
          evidence_note?: string | null;
          from_date?: string | null;
          id?: string;
          level?: string | null;
          organisation_id?: string | null;
          player_id: string;
          to_date?: string | null;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Update: {
          club_name?: string | null;
          created_at?: string;
          evidence_note?: string | null;
          from_date?: string | null;
          id?: string;
          level?: string | null;
          organisation_id?: string | null;
          player_id?: string;
          to_date?: string | null;
          updated_at?: string;
          verification_status?: Database["public"]["Enums"]["verification_status"];
        };
        Relationships: [
          {
            foreignKeyName: "player_club_history_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_club_history_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      player_consents: {
        Row: {
          consent_type: string;
          created_at: string;
          evidence_reference: string | null;
          granted_at: string | null;
          granted_by: string | null;
          id: string;
          player_id: string;
          scope: string | null;
          status: Database["public"]["Enums"]["consent_status"];
          updated_at: string;
          version: string;
          withdrawn_at: string | null;
        };
        Insert: {
          consent_type: string;
          created_at?: string;
          evidence_reference?: string | null;
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          player_id: string;
          scope?: string | null;
          status?: Database["public"]["Enums"]["consent_status"];
          updated_at?: string;
          version: string;
          withdrawn_at?: string | null;
        };
        Update: {
          consent_type?: string;
          created_at?: string;
          evidence_reference?: string | null;
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          player_id?: string;
          scope?: string | null;
          status?: Database["public"]["Enums"]["consent_status"];
          updated_at?: string;
          version?: string;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "player_consents_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_consents_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      player_guardians: {
        Row: {
          consent_status: Database["public"]["Enums"]["consent_status"];
          created_at: string;
          guardian_user_id: string;
          id: string;
          player_id: string;
          relationship: string | null;
          updated_at: string;
        };
        Insert: {
          consent_status?: Database["public"]["Enums"]["consent_status"];
          created_at?: string;
          guardian_user_id: string;
          id?: string;
          player_id: string;
          relationship?: string | null;
          updated_at?: string;
        };
        Update: {
          consent_status?: Database["public"]["Enums"]["consent_status"];
          created_at?: string;
          guardian_user_id?: string;
          id?: string;
          player_id?: string;
          relationship?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_guardians_guardian_user_id_fkey";
            columns: ["guardian_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "player_guardians_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      players: {
        Row: {
          completeness_percent: number;
          created_at: string;
          date_of_birth: string | null;
          display_name: string;
          dominant_foot: string | null;
          height_cm: number | null;
          id: string;
          is_minor: boolean;
          languages: string[];
          location: string | null;
          nationality: string | null;
          portrait_url: string | null;
          preferred_name: string | null;
          primary_academy_id: string | null;
          primary_position: string | null;
          profile_status: Database["public"]["Enums"]["profile_status"];
          secondary_positions: string[];
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          completeness_percent?: number;
          created_at?: string;
          date_of_birth?: string | null;
          display_name: string;
          dominant_foot?: string | null;
          height_cm?: number | null;
          id?: string;
          is_minor?: boolean;
          languages?: string[];
          location?: string | null;
          nationality?: string | null;
          portrait_url?: string | null;
          preferred_name?: string | null;
          primary_academy_id?: string | null;
          primary_position?: string | null;
          profile_status?: Database["public"]["Enums"]["profile_status"];
          secondary_positions?: string[];
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          completeness_percent?: number;
          created_at?: string;
          date_of_birth?: string | null;
          display_name?: string;
          dominant_foot?: string | null;
          height_cm?: number | null;
          id?: string;
          is_minor?: boolean;
          languages?: string[];
          location?: string | null;
          nationality?: string | null;
          portrait_url?: string | null;
          preferred_name?: string | null;
          primary_academy_id?: string | null;
          primary_position?: string | null;
          profile_status?: Database["public"]["Enums"]["profile_status"];
          secondary_positions?: string[];
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_primary_academy_id_fkey";
            columns: ["primary_academy_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "players_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      position_training_templates: {
        Row: {
          created_at: string;
          focus_points: string[];
          id: string;
          name: string;
          position_group: string;
        };
        Insert: {
          created_at?: string;
          focus_points?: string[];
          id?: string;
          name: string;
          position_group: string;
        };
        Update: {
          created_at?: string;
          focus_points?: string[];
          id?: string;
          name?: string;
          position_group?: string;
        };
        Relationships: [];
      };
      recruitment_enquiries: {
        Row: {
          access_expiry: string | null;
          access_granted_at: string | null;
          created_at: string;
          decided_at: string | null;
          decided_by: string | null;
          enquiry_type: string | null;
          id: string;
          message: string | null;
          player_id: string | null;
          recruiter_org_id: string;
          requested_by: string;
          status: Database["public"]["Enums"]["enquiry_status"];
          updated_at: string;
        };
        Insert: {
          access_expiry?: string | null;
          access_granted_at?: string | null;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          enquiry_type?: string | null;
          id?: string;
          message?: string | null;
          player_id?: string | null;
          recruiter_org_id: string;
          requested_by: string;
          status?: Database["public"]["Enums"]["enquiry_status"];
          updated_at?: string;
        };
        Update: {
          access_expiry?: string | null;
          access_granted_at?: string | null;
          created_at?: string;
          decided_at?: string | null;
          decided_by?: string | null;
          enquiry_type?: string | null;
          id?: string;
          message?: string | null;
          player_id?: string | null;
          recruiter_org_id?: string;
          requested_by?: string;
          status?: Database["public"]["Enums"]["enquiry_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "recruitment_enquiries_decided_by_fkey";
            columns: ["decided_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recruitment_enquiries_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recruitment_enquiries_recruiter_org_id_fkey";
            columns: ["recruiter_org_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recruitment_enquiries_requested_by_fkey";
            columns: ["requested_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      report_key_moments: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          media_asset_id: string | null;
          report_id: string;
          timestamp_sec: number | null;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          media_asset_id?: string | null;
          report_id: string;
          timestamp_sec?: number | null;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          media_asset_id?: string | null;
          report_id?: string;
          timestamp_sec?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "report_key_moments_media_fk";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "report_key_moments_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "scouting_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      report_position_notes: {
        Row: {
          attribute: string;
          created_at: string;
          id: string;
          note: string | null;
          report_id: string;
        };
        Insert: {
          attribute: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          report_id: string;
        };
        Update: {
          attribute?: string;
          created_at?: string;
          id?: string;
          note?: string | null;
          report_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "report_position_notes_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "scouting_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      scorecard_ratings: {
        Row: {
          category: Database["public"]["Enums"]["scorecard_category"];
          created_at: string;
          evidence_note: string | null;
          id: string;
          rating_1_to_10: number;
          report_id: string;
          updated_at: string;
          weight_snapshot: number;
        };
        Insert: {
          category: Database["public"]["Enums"]["scorecard_category"];
          created_at?: string;
          evidence_note?: string | null;
          id?: string;
          rating_1_to_10: number;
          report_id: string;
          updated_at?: string;
          weight_snapshot: number;
        };
        Update: {
          category?: Database["public"]["Enums"]["scorecard_category"];
          created_at?: string;
          evidence_note?: string | null;
          id?: string;
          rating_1_to_10?: number;
          report_id?: string;
          updated_at?: string;
          weight_snapshot?: number;
        };
        Relationships: [
          {
            foreignKeyName: "scorecard_ratings_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "scouting_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      scouting_assignments: {
        Row: {
          assigned_by: string | null;
          assignment_notes: string | null;
          created_at: string;
          due_date: string | null;
          id: string;
          match_id: string | null;
          objective: string | null;
          scout_user_id: string;
          status: Database["public"]["Enums"]["assignment_status"];
          target_player_id: string | null;
          target_position: string | null;
          updated_at: string;
        };
        Insert: {
          assigned_by?: string | null;
          assignment_notes?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          match_id?: string | null;
          objective?: string | null;
          scout_user_id: string;
          status?: Database["public"]["Enums"]["assignment_status"];
          target_player_id?: string | null;
          target_position?: string | null;
          updated_at?: string;
        };
        Update: {
          assigned_by?: string | null;
          assignment_notes?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          match_id?: string | null;
          objective?: string | null;
          scout_user_id?: string;
          status?: Database["public"]["Enums"]["assignment_status"];
          target_player_id?: string | null;
          target_position?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scouting_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scouting_assignments_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scouting_assignments_scout_user_id_fkey";
            columns: ["scout_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scouting_assignments_target_player_id_fkey";
            columns: ["target_player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      scouting_reports: {
        Row: {
          assignment_id: string | null;
          confidence: Database["public"]["Enums"]["confidence_level"];
          confidence_reason: string | null;
          created_at: string;
          development_areas: string | null;
          id: string;
          match_id: string | null;
          minutes_observed: number | null;
          narrative: string | null;
          player_id: string;
          position_observed: string | null;
          recommendation: Database["public"]["Enums"]["scout_recommendation"] | null;
          review_comment: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          role_observed: string | null;
          scout_user_id: string;
          status: Database["public"]["Enums"]["report_status"];
          strengths: string | null;
          submitted_at: string | null;
          updated_at: string;
          watched_scope: string | null;
          weighted_score: number | null;
        };
        Insert: {
          assignment_id?: string | null;
          confidence?: Database["public"]["Enums"]["confidence_level"];
          confidence_reason?: string | null;
          created_at?: string;
          development_areas?: string | null;
          id?: string;
          match_id?: string | null;
          minutes_observed?: number | null;
          narrative?: string | null;
          player_id: string;
          position_observed?: string | null;
          recommendation?: Database["public"]["Enums"]["scout_recommendation"] | null;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          role_observed?: string | null;
          scout_user_id: string;
          status?: Database["public"]["Enums"]["report_status"];
          strengths?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          watched_scope?: string | null;
          weighted_score?: number | null;
        };
        Update: {
          assignment_id?: string | null;
          confidence?: Database["public"]["Enums"]["confidence_level"];
          confidence_reason?: string | null;
          created_at?: string;
          development_areas?: string | null;
          id?: string;
          match_id?: string | null;
          minutes_observed?: number | null;
          narrative?: string | null;
          player_id?: string;
          position_observed?: string | null;
          recommendation?: Database["public"]["Enums"]["scout_recommendation"] | null;
          review_comment?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          role_observed?: string | null;
          scout_user_id?: string;
          status?: Database["public"]["Enums"]["report_status"];
          strengths?: string | null;
          submitted_at?: string | null;
          updated_at?: string;
          watched_scope?: string | null;
          weighted_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "scouting_reports_assignment_id_fkey";
            columns: ["assignment_id"];
            isOneToOne: false;
            referencedRelation: "scouting_assignments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scouting_reports_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scouting_reports_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scouting_reports_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "scouting_reports_scout_user_id_fkey";
            columns: ["scout_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      session_attendance: {
        Row: {
          created_at: string;
          engagement: string | null;
          id: string;
          player_id: string;
          present: boolean;
          session_id: string;
        };
        Insert: {
          created_at?: string;
          engagement?: string | null;
          id?: string;
          player_id: string;
          present?: boolean;
          session_id: string;
        };
        Update: {
          created_at?: string;
          engagement?: string | null;
          id?: string;
          player_id?: string;
          present?: boolean;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_attendance_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_attendance_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "training_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      session_goal_links: {
        Row: {
          goal_id: string;
          id: string;
          session_id: string;
        };
        Insert: {
          goal_id: string;
          id?: string;
          session_id: string;
        };
        Update: {
          goal_id?: string;
          id?: string;
          session_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_goal_links_goal_id_fkey";
            columns: ["goal_id"];
            isOneToOne: false;
            referencedRelation: "development_goals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_goal_links_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "training_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      session_observations: {
        Row: {
          coach_user_id: string | null;
          created_at: string;
          follow_up: string | null;
          id: string;
          observation: string | null;
          player_id: string;
          session_id: string;
          updated_at: string;
        };
        Insert: {
          coach_user_id?: string | null;
          created_at?: string;
          follow_up?: string | null;
          id?: string;
          observation?: string | null;
          player_id: string;
          session_id: string;
          updated_at?: string;
        };
        Update: {
          coach_user_id?: string | null;
          created_at?: string;
          follow_up?: string | null;
          id?: string;
          observation?: string | null;
          player_id?: string;
          session_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_observations_coach_user_id_fkey";
            columns: ["coach_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_observations_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_observations_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "training_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      shortlist_players: {
        Row: {
          added_at: string;
          added_by: string | null;
          id: string;
          notes: string | null;
          player_id: string;
          shortlist_id: string;
        };
        Insert: {
          added_at?: string;
          added_by?: string | null;
          id?: string;
          notes?: string | null;
          player_id: string;
          shortlist_id: string;
        };
        Update: {
          added_at?: string;
          added_by?: string | null;
          id?: string;
          notes?: string | null;
          player_id?: string;
          shortlist_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "shortlist_players_added_by_fkey";
            columns: ["added_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shortlist_players_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shortlist_players_shortlist_id_fkey";
            columns: ["shortlist_id"];
            isOneToOne: false;
            referencedRelation: "shortlists";
            referencedColumns: ["id"];
          },
        ];
      };
      shortlists: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
          organisation_id: string | null;
          purpose: string | null;
          updated_at: string;
          visibility: Database["public"]["Enums"]["media_visibility"];
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
          organisation_id?: string | null;
          purpose?: string | null;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["media_visibility"];
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
          organisation_id?: string | null;
          purpose?: string | null;
          updated_at?: string;
          visibility?: Database["public"]["Enums"]["media_visibility"];
        };
        Relationships: [
          {
            foreignKeyName: "shortlists_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "shortlists_organisation_id_fkey";
            columns: ["organisation_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
        ];
      };
      speed_subscores: {
        Row: {
          acceleration: number | null;
          created_at: string;
          football_speed: number | null;
          id: string;
          repeated_sprint: number | null;
          report_id: string;
          top_speed: number | null;
          updated_at: string;
        };
        Insert: {
          acceleration?: number | null;
          created_at?: string;
          football_speed?: number | null;
          id?: string;
          repeated_sprint?: number | null;
          report_id: string;
          top_speed?: number | null;
          updated_at?: string;
        };
        Update: {
          acceleration?: number | null;
          created_at?: string;
          football_speed?: number | null;
          id?: string;
          repeated_sprint?: number | null;
          report_id?: string;
          top_speed?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "speed_subscores_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: true;
            referencedRelation: "scouting_reports";
            referencedColumns: ["id"];
          },
        ];
      };
      training_microcycles: {
        Row: {
          created_at: string;
          id: string;
          intensity_intent: string | null;
          notes: string | null;
          programme_id: string;
          updated_at: string;
          week_label: string | null;
          week_start: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          intensity_intent?: string | null;
          notes?: string | null;
          programme_id: string;
          updated_at?: string;
          week_label?: string | null;
          week_start?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          intensity_intent?: string | null;
          notes?: string | null;
          programme_id?: string;
          updated_at?: string;
          week_label?: string | null;
          week_start?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "training_microcycles_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "training_programmes";
            referencedColumns: ["id"];
          },
        ];
      };
      training_programmes: {
        Row: {
          academy_id: string;
          age_band: Database["public"]["Enums"]["age_band"] | null;
          created_at: string;
          created_by: string | null;
          curriculum_id: string | null;
          end_date: string | null;
          id: string;
          name: string;
          start_date: string | null;
          status: Database["public"]["Enums"]["plan_status"];
          updated_at: string;
        };
        Insert: {
          academy_id: string;
          age_band?: Database["public"]["Enums"]["age_band"] | null;
          created_at?: string;
          created_by?: string | null;
          curriculum_id?: string | null;
          end_date?: string | null;
          id?: string;
          name: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          updated_at?: string;
        };
        Update: {
          academy_id?: string;
          age_band?: Database["public"]["Enums"]["age_band"] | null;
          created_at?: string;
          created_by?: string | null;
          curriculum_id?: string | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["plan_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "training_programmes_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_programmes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_programmes_curriculum_id_fkey";
            columns: ["curriculum_id"];
            isOneToOne: false;
            referencedRelation: "curriculum_templates";
            referencedColumns: ["id"];
          },
        ];
      };
      training_sessions: {
        Row: {
          academy_id: string;
          coach_user_id: string | null;
          created_at: string;
          duration_min: number | null;
          equipment: string | null;
          id: string;
          intensity_intent: string | null;
          location: string | null;
          microcycle_id: string | null;
          objective: string | null;
          programme_id: string | null;
          scheduled_at: string | null;
          session_delivered_note: string | null;
          status: Database["public"]["Enums"]["session_status"];
          title: string;
          updated_at: string;
        };
        Insert: {
          academy_id: string;
          coach_user_id?: string | null;
          created_at?: string;
          duration_min?: number | null;
          equipment?: string | null;
          id?: string;
          intensity_intent?: string | null;
          location?: string | null;
          microcycle_id?: string | null;
          objective?: string | null;
          programme_id?: string | null;
          scheduled_at?: string | null;
          session_delivered_note?: string | null;
          status?: Database["public"]["Enums"]["session_status"];
          title: string;
          updated_at?: string;
        };
        Update: {
          academy_id?: string;
          coach_user_id?: string | null;
          created_at?: string;
          duration_min?: number | null;
          equipment?: string | null;
          id?: string;
          intensity_intent?: string | null;
          location?: string | null;
          microcycle_id?: string | null;
          objective?: string | null;
          programme_id?: string | null;
          scheduled_at?: string | null;
          session_delivered_note?: string | null;
          status?: Database["public"]["Enums"]["session_status"];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "training_sessions_academy_id_fkey";
            columns: ["academy_id"];
            isOneToOne: false;
            referencedRelation: "organisations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_sessions_coach_user_id_fkey";
            columns: ["coach_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_sessions_microcycle_id_fkey";
            columns: ["microcycle_id"];
            isOneToOne: false;
            referencedRelation: "training_microcycles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "training_sessions_programme_id_fkey";
            columns: ["programme_id"];
            isOneToOne: false;
            referencedRelation: "training_programmes";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          display_name: string | null;
          email: string;
          id: string;
          is_super_admin: boolean;
          phone: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          email: string;
          id: string;
          is_super_admin?: boolean;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          email?: string;
          id?: string;
          is_super_admin?: boolean;
          phone?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      verification_records: {
        Row: {
          checked_at: string | null;
          checked_by: string | null;
          created_at: string;
          expires_at: string | null;
          id: string;
          notes: string | null;
          player_id: string;
          restricted_document_reference: string | null;
          status: Database["public"]["Enums"]["verification_status"];
          updated_at: string;
          verification_type: string;
        };
        Insert: {
          checked_at?: string | null;
          checked_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          notes?: string | null;
          player_id: string;
          restricted_document_reference?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          updated_at?: string;
          verification_type: string;
        };
        Update: {
          checked_at?: string | null;
          checked_by?: string | null;
          created_at?: string;
          expires_at?: string | null;
          id?: string;
          notes?: string | null;
          player_id?: string;
          restricted_document_reference?: string | null;
          status?: Database["public"]["Enums"]["verification_status"];
          updated_at?: string;
          verification_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "verification_records_checked_by_fkey";
            columns: ["checked_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "verification_records_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
        ];
      };
      workload_entries: {
        Row: {
          duration_min: number | null;
          id: string;
          note: string | null;
          perceived_exertion: number | null;
          player_id: string;
          recorded_at: string;
          recorded_by: string | null;
          session_id: string | null;
        };
        Insert: {
          duration_min?: number | null;
          id?: string;
          note?: string | null;
          perceived_exertion?: number | null;
          player_id: string;
          recorded_at?: string;
          recorded_by?: string | null;
          session_id?: string | null;
        };
        Update: {
          duration_min?: number | null;
          id?: string;
          note?: string | null;
          perceived_exertion?: number | null;
          player_id?: string;
          recorded_at?: string;
          recorded_by?: string | null;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "workload_entries_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "players";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workload_entries_recorded_by_fkey";
            columns: ["recorded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workload_entries_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "training_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      age_band: "u6_9" | "u10_12" | "u13_15" | "u16_18" | "u19_23";
      app_role:
        | "player"
        | "guardian"
        | "scout"
        | "academy_staff"
        | "tba_reviewer"
        | "recruiter"
        | "super_admin";
      assignment_status: "open" | "in_progress" | "submitted" | "completed" | "cancelled";
      confidence_level: "low" | "medium" | "high";
      consent_status: "granted" | "withdrawn" | "expired" | "pending";
      enquiry_status: "requested" | "approved" | "active" | "expired" | "revoked" | "declined";
      goal_status: "not_started" | "in_progress" | "achieved" | "deferred";
      invitation_status: "pending" | "accepted" | "revoked" | "expired";
      media_processing_status: "pending" | "processing" | "ready" | "failed";
      media_visibility: "private" | "internal" | "shared" | "public";
      organisation_type: "academy" | "club" | "agency" | "tba";
      plan_status: "active" | "completed" | "cancelled" | "archived";
      profile_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "active"
        | "needs_evidence"
        | "restricted"
        | "archived";
      report_status: "draft" | "submitted" | "needs_clarification" | "approved" | "rejected";
      scorecard_category:
        | "technical"
        | "tactical"
        | "physical"
        | "speed"
        | "decision_making"
        | "mental"
        | "consistency";
      scout_recommendation: "monitor" | "reassess" | "development_priority" | "technical_review";
      session_status: "planned" | "delivered" | "cancelled";
      verification_status: "unverified" | "pending" | "verified" | "rejected" | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      age_band: ["u6_9", "u10_12", "u13_15", "u16_18", "u19_23"],
      app_role: [
        "player",
        "guardian",
        "scout",
        "academy_staff",
        "tba_reviewer",
        "recruiter",
        "super_admin",
      ],
      assignment_status: ["open", "in_progress", "submitted", "completed", "cancelled"],
      confidence_level: ["low", "medium", "high"],
      consent_status: ["granted", "withdrawn", "expired", "pending"],
      enquiry_status: ["requested", "approved", "active", "expired", "revoked", "declined"],
      goal_status: ["not_started", "in_progress", "achieved", "deferred"],
      invitation_status: ["pending", "accepted", "revoked", "expired"],
      media_processing_status: ["pending", "processing", "ready", "failed"],
      media_visibility: ["private", "internal", "shared", "public"],
      organisation_type: ["academy", "club", "agency", "tba"],
      plan_status: ["active", "completed", "cancelled", "archived"],
      profile_status: [
        "draft",
        "submitted",
        "under_review",
        "active",
        "needs_evidence",
        "restricted",
        "archived",
      ],
      report_status: ["draft", "submitted", "needs_clarification", "approved", "rejected"],
      scorecard_category: [
        "technical",
        "tactical",
        "physical",
        "speed",
        "decision_making",
        "mental",
        "consistency",
      ],
      scout_recommendation: ["monitor", "reassess", "development_priority", "technical_review"],
      session_status: ["planned", "delivered", "cancelled"],
      verification_status: ["unverified", "pending", "verified", "rejected", "expired"],
    },
  },
} as const;
