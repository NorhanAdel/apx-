"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-coverflow";

export default function PlayersSlider() {
  const players = [
    { id: 1, img: "/p1.png" },
    { id: 2, img: "/p2.jpg" },
    { id: 3, img: "/p3.png" },
    { id: 4, img: "/p2.jpg" },
    { id: 5, img: "/p1.png" },
  ];

  return (
    <div className="w-full px-2 sm:px-3 md:px-8 lg:px-12 pt-38 sm:pt-38 md:pt-24 lg:pt-38 pb-10">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        loop={true}
        modules={[EffectCoverflow]}
        breakpoints={{
          0: {
            slidesPerView: 1.4, //  
          },
          480: {
            slidesPerView: 1.6, //  
          },
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 2,
          slideShadows: false,
        }}
        className="w-full"
      >
        {players.map((player) => (
          <SwiperSlide key={player.id}>
            <Link href={`/football/${player.id}`}>
              <div className="relative w-full h-[220px] sm:h-[260px] sm:w-[320px] md:h-[280px] lg:h-[320px] xl:w-[550px] xl:h-[340px] rounded-xl overflow-hidden cursor-pointer group">
                <Image
                  src={player.img}
                  alt="player"
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition" />
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
