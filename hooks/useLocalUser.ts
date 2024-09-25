import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserInfo = {
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
};

export const useLocalUser = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadLocalUser = async () => {
      try {
        const data = await AsyncStorage.getItem("@user");
        if (data) {
          const user: UserInfo = JSON.parse(data);
          setUserInfo(user);
        }
      } catch (error) {
        console.error("Error loading local user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLocalUser();
  }, []);

  const removeLocalUser = async () => {
    try {
      await AsyncStorage.removeItem("@user");
      setUserInfo(null);
    } catch (error) {
      console.error("Error removing local user:", error);
    }
  };

  return { userInfo, setUserInfo, removeLocalUser, loading };
};
