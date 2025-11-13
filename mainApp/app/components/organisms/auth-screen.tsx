import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, KeyboardAvoidingView, Platform, ScrollView, View, useColorScheme } from 'react-native';
import { Button, Card, Icon, Input, Text, ThemeProvider, createTheme, useTheme } from '@rneui/themed';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { auth } from '@/firebaseConfig';
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
} from 'firebase/auth';

const AuthScreenContent = () => {
    const router = useRouter();
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const handleSubmit = async () => {
        if (!email || !password) {
            Alert.alert("入力不足", "メールアドレスとパスワードを入力してください。");
            return;
        }

        setIsSubmitting(true);
        try {
            if (authMode === "signup") {
                await createUserWithEmailAndPassword(auth, email, password);
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
            router.replace("/(tabs)/new");
        } catch (err: any) {
            Alert.alert("エラー", err.message ?? "認証に失敗しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace("/(tabs)/new");
            }
            setInitializing(false);
        });

        return unsubscribe;
    }, [router]);

    useFocusEffect(
        useCallback(() => {
            navigation.setOptions({
                headerShown: false,
                gestureEnabled: false,
            });

            const handleBackPress = () => true;
            const backHandlerSubscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);

            return () => {
                backHandlerSubscription.remove();
            };
        }, [navigation]),
    );

    if (initializing) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: theme.colors.background,
                }}
            >
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1, backgroundColor: theme.colors.background }}
        >
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    padding: 9,
                    justifyContent: "center",
                    backgroundColor: theme.colors.background,
                }}
                keyboardShouldPersistTaps="handled"
            >
                <Card
                    containerStyle={{
                        borderRadius: 16,
                        paddingVertical: 32,
                        paddingHorizontal: 20,
                        shadowColor: "#000",
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 4,
                        borderWidth: 0,
                    }}
                >
                    <View style={{ alignItems: "center", marginBottom: 24 }}>
                        <Icon
                            name={authMode === "login" ? "login" : "account-plus"}
                            type="material-community"
                            size={48}
                            color={theme.colors.primary}
                        />
                        <Text h3 style={{ marginTop: 16 }}>
                            {authMode === "login" ? "おかえりなさい" : "初めてのご利用ですか？"}
                        </Text>
                        <Text style={{ color: theme.colors.grey3, marginTop: 8, textAlign: "center" }}>
                            {authMode === "login"
                                ? "登録済みのメールアドレスとパスワードでログインしてください。"
                                : "必要事項を入力してアカウントを作成しましょう。"}
                        </Text>
                    </View>

                    <Input
                        label="メールアドレス"
                        placeholder="example@example.com"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        textContentType="emailAddress"
                        disabled={isSubmitting}
                        leftIcon={<Icon name="email-outline" type="material-community" size={22} color={theme.colors.grey2} />}
                        inputContainerStyle={{
                            borderBottomWidth: 0,
                            backgroundColor: theme.colors.grey5,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                        }}
                        inputStyle={{ marginLeft: 8 }}
                        containerStyle={{ paddingHorizontal: 0 }}
                    />

                    <Input
                        label="パスワード"
                        placeholder="********"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        textContentType="password"
                        disabled={isSubmitting}
                        leftIcon={<Icon name="lock-outline" type="material-community" size={22} color={theme.colors.grey2} />}
                        inputContainerStyle={{
                            borderBottomWidth: 0,
                            backgroundColor: theme.colors.grey5,
                            borderRadius: 12,
                            paddingHorizontal: 12,
                        }}
                        inputStyle={{ marginLeft: 8 }}
                        containerStyle={{ paddingHorizontal: 0 }}
                    />

                    <Button
                        title={authMode === "login" ? "ログイン" : "新規登録"}
                        onPress={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        icon={
                            <Icon
                                name={authMode === "login" ? "login" : "account-plus-outline"}
                                type="material-community"
                                color="#fff"
                                size={20}
                                style={{ marginRight: 8 }}
                            />
                        }
                        buttonStyle={{ borderRadius: 12, paddingVertical: 14 }}
                        containerStyle={{ marginTop: 12 }}
                    />

                    <Button
                        type="clear"
                        title={authMode === "login" ? "アカウントを作成する" : "ログイン画面へ"}
                        onPress={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                        disabled={isSubmitting}
                        titleStyle={{ color: theme.colors.primary }}
                        containerStyle={{ marginTop: 8 }}
                    />
                </Card>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const AuthScreen = () => {
    const colorScheme = useColorScheme();
    const theme = useMemo(
        () =>
            createTheme({
                mode: colorScheme === "dark" ? "dark" : "light",
                lightColors: {
                    primary: "#2565c7",
                    secondary: "#6c9df0",
                    background: "#f4f6fb",
                },
                darkColors: {
                    primary: "#8ab4ff",
                    secondary: "#5f84d8",
                    background: "#0b1324",
                },
                components: {
                    Button: {
                        titleStyle: {
                            fontWeight: "600",
                        },
                    },
                },
            }),
        [colorScheme],
    );

    return (
        <ThemeProvider theme={theme}>
            <AuthScreenContent />
        </ThemeProvider>
    );
};

export default AuthScreen;