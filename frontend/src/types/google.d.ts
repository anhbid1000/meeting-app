export { };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            use_fedcm_for_prompt?: boolean;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              width?: string | number;
              text?: "signin_with" | "signup_with" | "continue_with";
            }
          ) => void;
        };
      };
    };
  }
}
