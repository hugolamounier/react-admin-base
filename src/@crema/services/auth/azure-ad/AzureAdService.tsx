import { UserAgentApplication } from "msal";
const graph = require("@microsoft/microsoft-graph-client");

export class AzureAdService {
  static userAgentApplication: UserAgentApplication = new UserAgentApplication({
    auth: {
      clientId: process.env.REACT_APP_AZURE_AD_CLIENT_ID as string,
      redirectUri: process.env.REACT_APP_AZURE_AD_REDIRECT_URL as string,
      authority: process.env.REACT_APP_AZURE_AD_AUTHORITY as string,
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: true,
    },
  });
  static scopes: string[] = ["user.read"];

  static async getAccessToken() : Promise<string> {
    try {
      const accessToken =
        await AzureAdService.userAgentApplication.acquireTokenSilent({
          scopes: AzureAdService.scopes,
        });

      return accessToken.accessToken;
    } catch (e) {
      console.log(e);
    }
  }

  static async login() : Promise<string> {
    try {
      await AzureAdService.userAgentApplication.loginPopup({
        scopes: AzureAdService.scopes,
        prompt: "select_account",
      });

      return await this.getAccessToken();
    } catch (e) {
      console.log(e);
    }
  }

  private static getAuthenticatedClient(accessToken: string) {
    return graph.Client.init({
      authProvider: (done: any) => {
        done(null, accessToken);
      },
    });
  }

  public static async getUserDetails(accessToken: string) {
    const client = this.getAuthenticatedClient(accessToken);

    return await client.api("/me").get();
  }
}
