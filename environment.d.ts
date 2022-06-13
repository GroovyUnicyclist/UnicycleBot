declare global {
    namespace NodeJS {
      interface ProcessEnv {
        TOKEN: string;
        CLIENT_ID: string;
        GUILD_ID: string;
        GAME_MANAGER: string;
        DATABASE_URL: string;
        TEST_DATABASE_URL: string;
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {}