import React, { FC } from "react";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Box } from "zmp-ui";

import { getDummyImage } from "utils/product";

export const Banner: FC = () => {
    return (
        <Box className="bg-white" pb={4}>
            <Swiper
                modules={[Pagination]}
                pagination={{
                    clickable: true,
                }}
                autoplay
                loop
                cssMode
            >
                {[1, 2, 3, 4, 5]
                    .map(i => getDummyImage(`banner-${i}.webp`))
                    .map((banner, i) => (
                        <SwiperSlide key={i} className="px-4">
                            <Box
                                className="w-full rounded-lg aspect-[2/1] bg-cover bg-center bg-skeleton"
                                style={{ backgroundImage: `url(${banner})` }}
                            />
                        </SwiperSlide>
                    ))}
            </Swiper>
        </Box>
    );
};
