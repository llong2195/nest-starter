import { computeDestinationPoint, getBoundsOfDistance } from 'geolib';

import { ApiProperty } from '@nestjs/swagger';

export class Point {
  @ApiProperty({})
  latitude: number;

  @ApiProperty({})
  longitude: number;

  constructor(partial: Partial<Point>) {
    Object.assign(this, partial);
  }
}

export class GeoHelper {
  /**
   * It takes a point and a distance and returns the rate of change of latitude and longitude for that
   * distance
   * @param {Point} point - The point you want to get the rate for.
   * @param {number} distance - The distance in meters from the point to the edge of the circle.
   * @returns an object with two properties: rLat and rLon.
   */
  getRateLatLon(
    point: Point,
    distance: number,
  ): { rLat: number; rLon: number } {
    const pos1 = computeDestinationPoint(
      { latitude: point.latitude, longitude: point.longitude },
      distance,
      180,
    );

    const pos2 = computeDestinationPoint(
      { latitude: point.latitude, longitude: point.longitude },
      distance,
      90,
    );

    return {
      rLat: pos1.latitude - point.latitude,
      rLon: pos2.longitude - point.longitude,
    };
  }

  /**
   * It takes a point and a distance and returns a start and end point that represents a square around
   * the point
   * @param {Point} point - The point to find the bounds of.
   * @param {number} distance - The distance in meters from the point to search around.
   * @returns A point object with a start and end property.
   */
  findARound(point: Point, distance: number): { start: Point; end: Point } {
    const lo = getBoundsOfDistance(point, distance);

    return {
      start: new Point(lo[0]),
      end: new Point(lo[1]),
    };
  }

  /**
   * It takes a number, rounds it to 4 decimal places, and returns the result
   * @param {number} no - The number to round.
   * @returns A function that takes a number and returns a rounded number.
   */
  roundLatLon(no: number): number {
    return Math.round(no * 10000) / 10000;
  }

  /**
   * Check if the given number is a valid latitude.
   * @param {number} lat - number - The latitude to check.
   * @returns A function that takes a number and returns a boolean.
   */
  checkLatitude(lat: number): boolean {
    return isFinite(lat) && Math.abs(lat) <= 90;
  }

  /**
   * Check if the given longitude is valid.
   * @param {number} long - number - The longitude to check.
   * @returns A function that takes a number and returns a boolean.
   */
  checkLongitude(long: number): boolean {
    return isFinite(long) && Math.abs(long) <= 180;
  }
}
