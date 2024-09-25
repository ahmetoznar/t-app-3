import { Button, Image, StyleSheet, Text, View } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";

type UserInfo = {
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
};

export default function HomeScreen() {
  const [token, setToken] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:
      "701884874134-4esrj1av3v6a2p65rvmjtvjo8042iquv.apps.googleusercontent.com",
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    if (!user) {
      if (response?.type === "success" && response.authentication) {
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log("Loaded locally");
    }
  }

  const getLocalUser = async (): Promise<UserInfo | null> => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token: string) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const user: UserInfo = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      console.error("Error fetching user info: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedView>
        {!userInfo ? (
          <Button
            title="Sign in with Google"
            disabled={!request}
            onPress={() => promptAsync()}
          />
        ) : (
          <View style={styles.card}>
            {userInfo.picture && (
              <Image source={{ uri: userInfo.picture }} style={styles.image} />
            )}
            <Text style={styles.text}>Email: {userInfo.email}</Text>
            <Text style={styles.text}>
              Verified: {userInfo.verified_email ? "Yes" : "No"}
            </Text>
            <Text style={styles.text}>Name: {userInfo.name}</Text>
          </View>
        )}
        <Button
          title="Remove local storage"
          onPress={async () => {
            await AsyncStorage.removeItem("@user");
            setUserInfo(null);
          }}
        />
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
