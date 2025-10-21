import { Button, Card, Text } from '@rneui/themed';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { TravelExpenseFormData } from '../../../schemas/user-schema';

interface ConfirmationScreenProps {
    formData: TravelExpenseFormData;
    onEdit: () => void;
    onConfirm: () => void;
}

const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
    formData,
    onEdit,
    onConfirm
}) => {
    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ padding: 15 }}>
                <Text h4 style={{ 
                    textAlign: 'center', 
                    marginBottom: 20,
                    textDecorationLine: 'underline'
                }}>
                    入力内容の確認
                </Text>

                {/* 出張先 */}
                <View style={{ marginBottom: 15 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                        出張先：
                    </Text>
                    <Text style={{ fontSize: 16, marginLeft: 10 }}>
                        {formData.destination || '未入力'}
                    </Text>
                </View>

                {/* 出張の目的 */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                        出張の目的：
                    </Text>
                    <Text style={{ fontSize: 16, marginLeft: 10 }}>
                        {formData.purpose || '未入力'}
                    </Text>
                </View>

                {/* 移動した日付と詳細情報 */}
                <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                        移動した日付と詳細情報：
                    </Text>

                    {/* 公共交通機関 */}
                    {formData.publicTransportDetails && formData.publicTransportDetails.length > 0 && (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ 
                                fontSize: 14, 
                                fontWeight: 'bold', 
                                color: 'red',
                                marginBottom: 10 
                            }}>
                                公共交通機関及び航空機を利用した場合
                            </Text>
                            {formData.publicTransportDetails.map((detail: any, index: number) => (
                                <Card key={index} containerStyle={{
                                    borderRadius: 10,
                                    borderColor: 'red',
                                    borderWidth: 1,
                                    marginBottom: 10
                                }}>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                                        ブロック{index + 1}
                                    </Text>
                                    <Text>日付：{detail.date || '未入力'}</Text>
                                    <Text>交通手段：{detail.transportMethod || '未入力'}</Text>
                                    <Text>発地：{detail.departure || '未入力'}</Text>
                                    <Text>着地：{detail.arrival || '未入力'}</Text>
                                    <Text>片道の交通費：{detail.oneWayFare || '0'}円</Text>
                                </Card>
                            ))}
                        </View>
                    )}

                    {/* レンタカーまたは自家用車 */}
                    {formData.carUsageDetails && formData.carUsageDetails.length > 0 ? (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ 
                                fontSize: 14, 
                                fontWeight: 'bold', 
                                color: 'green',
                                marginBottom: 10 
                            }}>
                                レンタカーまたは自家用車を利用した場合
                            </Text>
                            {formData.carUsageDetails.map((detail: any, index: number) => (
                                <Card key={index} containerStyle={{
                                    borderRadius: 10,
                                    borderColor: 'green',
                                    borderWidth: 1,
                                    marginBottom: 10
                                }}>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                                        ブロック{index + 1}
                                    </Text>
                                    <Text>日付：{detail.date || '未入力'}</Text>
                                    <Text>交通手段：{detail.transportMethod || '未入力'}</Text>
                                    <Text>発地：{detail.departure || '未入力'}</Text>
                                    <Text>着地：{detail.arrival || '未入力'}</Text>
                                    {detail.transportMethod === 'レンタカー' && (
                                        <Text>レンタカー代：{detail.rentalFee || '0'}円</Text>
                                    )}
                                    {detail.transportMethod === '自家用車' && (
                                        <Text>移動距離：{detail.distance || '0'}km</Text>
                                    )}
                                    {detail.tolls && detail.tolls.length > 0 && (
                                        <Text>高速料金：{detail.tolls.map((t: any) => t.amount).join(', ')}円</Text>
                                    )}
                                    {detail.gasoline && detail.gasoline.length > 0 && (
                                        <Text>ガソリン代：{detail.gasoline.map((g: any) => g.amount).join(', ')}円</Text>
                                    )}
                                    {detail.parking && detail.parking.length > 0 && (
                                        <Text>駐車場代：{detail.parking.map((p: any) => p.amount).join(', ')}円</Text>
                                    )}
                                </Card>
                            ))}
                        </View>
                    ) : (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ 
                                fontSize: 14, 
                                fontWeight: 'bold', 
                                color: 'green',
                                marginBottom: 5 
                            }}>
                                レンタカーまたは自家用車を利用した場合
                            </Text>
                            <Text style={{ textAlign: 'center', fontSize: 16 }}>なし</Text>
                        </View>
                    )}

                    {/* その他の交通手段 */}
                    {formData.otherTransportDetails && formData.otherTransportDetails.length > 0 ? (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ 
                                fontSize: 14, 
                                fontWeight: 'bold', 
                                marginBottom: 10 
                            }}>
                                その他の交通手段を利用した場合
                            </Text>
                            {formData.otherTransportDetails.map((detail: any, index: number) => (
                                <Card key={index} containerStyle={{
                                    borderRadius: 10,
                                    borderColor: '#ddd',
                                    borderWidth: 1,
                                    marginBottom: 10
                                }}>
                                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
                                        ブロック{index + 1}
                                    </Text>
                                    <Text>日付：{detail.date || '未入力'}</Text>
                                    <Text>交通手段：{detail.transportMethod || '未入力'}</Text>
                                    <Text>発地：{detail.departure || '未入力'}</Text>
                                    <Text>着地：{detail.arrival || '未入力'}</Text>
                                    <Text>合計金額：{detail.totalAmount || '0'}円</Text>
                                </Card>
                            ))}
                        </View>
                    ) : (
                        <View style={{ marginBottom: 15 }}>
                            <Text style={{ 
                                fontSize: 14, 
                                fontWeight: 'bold', 
                                marginBottom: 5 
                            }}>
                                その他の交通手段を利用した場合
                            </Text>
                            <Text style={{ textAlign: 'center', fontSize: 16 }}>なし</Text>
                        </View>
                    )}
                </View>

                {/* 日当区分と日数情報 */}
                {formData.dailyAllowanceDetails && formData.dailyAllowanceDetails.length > 0 ? (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                            日当区分と日数情報：
                        </Text>
                        {formData.dailyAllowanceDetails.map((detail: any, index: number) => (
                            <Card key={index} containerStyle={{
                                borderRadius: 10,
                                borderColor: 'purple',
                                borderWidth: 1,
                                marginBottom: 10
                            }}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: 'purple' }}>
                                    日当区分{index + 1}
                                </Text>
                                <Text>区分：{detail.dailyAllowanceCategory || '未入力'}</Text>
                                <Text>宿泊日数：{detail.numberOfDays || '0'} 泊</Text>
                            </Card>
                        ))}
                    </View>
                ) : (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                            日当区分と日数情報：
                        </Text>
                        <Text style={{ fontSize: 16, marginLeft: 10 }}>未入力</Text>
                    </View>
                )}

                {/* 宿泊区分と宿泊日数情報 */}
                {formData.lodgingDetails && formData.lodgingDetails.length > 0 ? (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                            宿泊区分と宿泊日数情報：
                        </Text>
                        {formData.lodgingDetails.map((detail: any, index: number) => (
                            <Card key={index} containerStyle={{
                                borderRadius: 10,
                                borderColor: 'purple',
                                borderWidth: 1,
                                marginBottom: 10
                            }}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 5, color: 'purple' }}>
                                    宿泊区分{index + 1}
                                </Text>
                                <Text>区分：{detail.lodgingCategory || '未入力'}</Text>
                                <Text>宿泊日数：{detail.numberOfDays || '0'} 泊</Text>
                            </Card>
                        ))}
                    </View>
                ) : (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 5 }}>
                            宿泊区分と宿泊日数情報：
                        </Text>
                        <Text style={{ fontSize: 16, marginLeft: 10 }}>未入力</Text>
                    </View>
                )}

                {/* 領収書 */}
                <View style={{ marginBottom: 30 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                        領収書
                    </Text>
                    <View style={{
                        backgroundColor: '#ddd',
                        height: 200,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10
                    }}>
                        <Text style={{ color: '#666' }}>領収書 画像</Text>
                    </View>
                </View>

                {/* 修正・確定ボタン */}
                <Button
                    title="修正"
                    onPress={onEdit}
                    buttonStyle={{
                        backgroundColor: '#4A90E2',
                        borderRadius: 8,
                        paddingVertical: 15,
                        marginBottom: 15
                    }}
                    titleStyle={{
                        fontSize: 18,
                        fontWeight: 'bold'
                    }}
                />

                <Button
                    title="確定"
                    onPress={onConfirm}
                    buttonStyle={{
                        backgroundColor: '#FF6B6B',
                        borderRadius: 8,
                        paddingVertical: 15,
                        marginBottom: 30
                    }}
                    titleStyle={{
                        fontSize: 18,
                        fontWeight: 'bold'
                    }}
                />
            </View>
        </ScrollView>
    );
};

export default ConfirmationScreen;

