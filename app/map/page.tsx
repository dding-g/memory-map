"use client";
import EXIF from "exif-js";

import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const MapPage = () => {
  const [photos, setPhotos] = useState([]);

  const getExifData = (imagePath: string) => {
    return new Promise((resolve, reject) => {
      // 이미지를 로드
      const img = new Image();
      img.src = imagePath;

      // 이미지 로드 후 EXIF 데이터 추출
      img.onload = function () {
        EXIF.getData(this, function () {
          const exifData = EXIF.getAllTags(this);
          resolve(exifData);
          var exifLong = EXIF.getTag(this, "GPSLongitude");
          var exifLat = EXIF.getTag(this, "GPSLatitude");
          console.log({ exifLong, exifLat });
        });
      };

      img.onerror = function (error) {
        reject(error);
      };
    });
  };

  const convertDMSToDD = (dmsArray: any) => {
    const degrees = dmsArray[0];
    const minutes = dmsArray[1];
    const seconds = dmsArray[2];

    const dd = degrees + minutes / 60 + seconds / (60 * 60);
    return dd;
  };

  useEffect(() => {
    // 아이폰 사진의 위치 정보 가져오기
    const getPhotoLocation = async () => {
      try {
        // 예시: public 폴더에 있는 이미지 파일의 경로
        const imagePath = "/1.jpg";

        // 이미지를 로드하여 EXIF 데이터 가져오기
        const exifData = await getExifData(imagePath);
        // EXIF 데이터에서 위도와 경도 추출
        const { GPSLatitude, GPSLongitude } = exifData;
        if (GPSLatitude && GPSLongitude) {
          const latitude = convertDMSToDD(GPSLatitude);
          const longitude = convertDMSToDD(GPSLongitude);

          // 새로운 사진 정보를 상태에 추가
          setPhotos((prevPhotos) => [...prevPhotos, { latitude, longitude }]);
        }
      } catch (error) {
        console.error("Error loading image or extracting EXIF data:", error);
      }
    };

    getPhotoLocation();
  }, []);

  return (
    <div className="fixed inset-0 bg-white flex justify-center items-center">
      <div className="w-[800px] h-[800px]">
        <LoadScript
          googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
        >
          <GoogleMap
            mapContainerStyle={{ width: "100%", height: "100%" }}
            center={{ lat: 0, lng: 0 }}
            zoom={4}
          >
            {photos.map((photo, index) => (
              <Marker
                key={index}
                position={{ lat: photo.latitude, lng: photo.longitude }}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default MapPage;
