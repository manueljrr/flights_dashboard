# -*- coding: utf-8 -*-

from rest_pandas import PandasSimpleView
from rest_framework.views import APIView
from rest_framework.response import Response

import pandas as pd

from .utils import get_route_stats


class FlightsApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        flights_df['DATE'] = flights_df['DATE'].dt.strftime('%d/%m/%Y')
        flights_df['DEP_TIME'] = flights_df['DEP_TIME'].dt.strftime('%H:%M:%S')
        flights_df['DEP_LOCAL_TIME'] = flights_df['DEP_LOCAL_TIME'].dt.strftime('%H:%M:%S')
        flights_df['ARR_TIME'] = flights_df['ARR_TIME'].dt.strftime('%H:%M:%S')
        flights_df['ARR_LOCAL_TIME'] = flights_df['ARR_LOCAL_TIME'].dt.strftime('%H:%M:%S')

        return flights_df


class AirportTrafficApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        dep_df = flights_df.groupby(['DATE', 'DEP'])
        dep_df = dep_df.size().reset_index().rename(columns={'DEP': 'AIRPORT', 0: 'DEPARTURES'})

        arr_df = flights_df.groupby(['DATE', 'ARR'])
        arr_df = arr_df.size().reset_index().rename(columns={'ARR': 'AIRPORT', 0: 'ARRIVALS'})

        traffic_df = dep_df.copy().merge(arr_df)
        return traffic_df


class AirportsApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        airports_df = pd.read_csv("airports.csv")

        airports_df['code'] = airports_df['iata_code']

        return airports_df.set_index('iata_code')


class RoutesApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        cols = ['DATE', 'DEP', 'ARR']

        routes_df = flights_df[cols].groupby(cols)

        return routes_df.size().reset_index()[cols]


class FlightsByDateApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        flights_df['DATE'] = flights_df['DATE'].dt.strftime('%Y-%m-%d')

        flights_df = flights_df.groupby('DATE').size().reset_index().rename(columns={0: 'FLIGHTS'})

        return flights_df


class RoutesByDateApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        # flights_df['DATE'] = flights_df['DATE'].dt.strftime('%d/%m/%Y')
        flights_df['DATE'] = flights_df['DATE'].dt.strftime('%Y-%m-%d')

        flights_df = flights_df.groupby(['DATE', 'LOF_ID']).size().reset_index()[['DATE', 'LOF_ID']]

        return flights_df.groupby('DATE').size().reset_index().rename(columns={0: 'ROUTES'})


class LofRoutesApiView1(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        flights_df = flights_df.groupby(['DATE', 'LOF_ID']).size().reset_index()[['DATE', 'LOF_ID']]

        return flights_df


class DeparturesApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        flights_df['DURATION'] = (flights_df['ARR_TIME'] - flights_df['DEP_TIME']).astype('timedelta64[m]')

        flights_df = flights_df.groupby(['DEP', 'ARR'])['DURATION'].apply(get_route_stats).unstack().reset_index()

        return flights_df


class ArrivalsApiView(PandasSimpleView):

    def get_data(self, request, *args, **kwargs):
        flights_df = pd.read_excel("flights_data.xlsx")

        flights_df['DURATION'] = (flights_df['ARR_TIME'] - flights_df['DEP_TIME']).astype('timedelta64[m]')

        flights_df = flights_df.groupby(['ARR', 'DEP'])['DURATION'].apply(get_route_stats).unstack().reset_index()

        return flights_df


class LofRoutesApiView(APIView):

    def get(self, request, format=None):
        flights_df = pd.read_excel("flights_data.xlsx")

        flights_df['DATE'] = flights_df['DATE'].dt.strftime('%m/%d/%Y')
        flights_df['DEP_TIME'] = flights_df['DEP_TIME'].dt.strftime('%H:%M')
        flights_df['ARR_TIME'] = flights_df['ARR_TIME'].dt.strftime('%H:%M')

        result_dict = {}

        for date_str, date_group in flights_df.groupby('DATE'):
            result_dict[date_str] = {}

            for lof_id, lof_group in date_group.groupby('LOF_ID'):
                result_dict[date_str][lof_id] = lof_group[['DEP', 'ARR', 'DEP_TIME', 'ARR_TIME']].to_dict(orient='records')

        return Response(result_dict)

