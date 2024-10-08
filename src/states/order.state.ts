import { atom, selector } from "recoil";
import { getLocation } from "zmp-sdk";

import { Store } from "types/delivery";
import { calculateDistance } from "utils/location";
import stores from "../../mock/stores.json";

export const orderNoteState = atom({
    key: "orderNote",
    default: "",
});

export const selectedDeliveryTimeState = atom({
    key: "selectedDeliveryTime",
    default: +new Date(),
});

export const storesState = atom<Store[]>({
    key: "stores",
    default: stores,
});

export const requestLocationTriesState = atom({
    key: "requestLocationTries",
    default: 0,
});

export const selectedStoreIndexState = atom({
    key: "selectedStoreIndex",
    default: 0,
});

export const selectedStoreState = selector({
    key: "selectedStore",
    get: ({ get }) => {
        const index = get(selectedStoreIndexState);
        const stores = get(nearbyStoresState);
        return stores[index];
    },
});

/**
 * Truy xuất và lọc các cửa hàng lân cận dựa trên vị trí hiện tại.
 *
 * @returns {Promise<Store[]>} - Một Promise thành :
 * * Một mảng các đối tượng `Store` đại diện cho các cửa hàng lân cận, được sắp xếp theo khoảng cách (gần nhất trước tiên).
 */
export const nearbyStoresState = selector({
    key: "nearbyStores",
    get: ({ get }) => {
        // Get the current location from the locationState atom
        const location = get(locationState);

        // Get the list of stores from the storesState atom
        const stores = get(storesState);

        // Calculate the distance of each store from the current location
        if (location) {
            const storesWithDistance = stores.map(store => ({
                ...store,
                distance: calculateDistance(location.latitude, location.longitude, store.lat, store.long),
            }));

            // Sort the stores by distance from the current location
            const nearbyStores = storesWithDistance.sort((a, b) => a.distance - b.distance);

            return nearbyStores;
        }
        return [];
    },
});

/**
 * Truy xuất và trả về vị trí hiện tại của người dùng.
 *
 * **Ghi chú quan trọng:**
 * - selector này ưu tiên quyền riêng tư của người dùng và chỉ truy xuất dữ liệu vị trí khi có sự cho phép rõ ràng của người dùng.
 * - Vị trí dự phòng chỉ nên được sử dụng để phát triển và không được đưa vào các bản dựng sản xuất.
 *
 * @returns {Promise<object | false>} - Một Promise:
 * * Một đối tượng có thuộc tính `latitude` (chuỗi) và `kinh độ` (chuỗi) đại diện cho vị trí của người dùng (nếu thành công).
 * * `false` nếu truy xuất vị trí không thành công hoặc người dùng chưa cấp quyền truy cập.
 */
export const locationState = selector<{ latitude: string; longitude: string } | false>({
    key: "location",
    get: async ({ get }) => {
        const requested = get(requestLocationTriesState);
        if (requested) {
            const { latitude, longitude, token } = await getLocation({
                fail: console.warn,
            });
            if (latitude && longitude) {
                return { latitude, longitude };
            }
            if (token) {
                console.warn("Sử dụng token này để truy xuất vị trí chính xác của người dùng", token);
                console.warn(
                    "Chi tiết tham khảo: ",
                    "https://mini.zalo.me/blog/thong-bao-thay-doi-luong-truy-xuat-thong-tin-nguoi-dung-tren-zalo-mini-app",
                );
                console.warn("Giả lập vị trí mặc định: VNG Campus");
                return {
                    latitude: "10.7287",
                    longitude: "106.7317",
                };
            }
        }
        return false;
    },
});
