export type Tools = {
  [key: string]: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: {
        [key: string]: {
          type: string;
          description: string;
          enum?: string[];
          items?: {
            type: string;
            description: string;
          };
        };
      };
      required: string[];
    }
  }
}
