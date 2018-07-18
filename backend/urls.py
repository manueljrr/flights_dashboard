# -*- coding: utf-8 -*-

from django.conf.urls import include, url
from backend import views as backend_views
from django.views.generic import RedirectView


urlpatterns = [
    url(
        r'^data/$',
        backend_views.FlightsApiView.as_view(),
        name='flights_data'
    ),
    url(
        r'^airport-traffic/$',
        backend_views.AirportTrafficApiView.as_view(),
        name='airport_traffic'
    ),
    url(
        r'^airports/$',
        backend_views.AirportsApiView.as_view(),
        name='airports'
    ),
    url(
        r'^routes/$',
        backend_views.RoutesApiView.as_view(),
        name='routes'
    ),
    url(
        r'^flights-by-date/$',
        backend_views.FlightsByDateApiView.as_view(),
        name='flights_by_date'
    ),
    url(
        r'^routes-by-date/$',
        backend_views.RoutesByDateApiView.as_view(),
        name='routes_by_date'
    ),
    url(
        r'^lof-routes/$',
        backend_views.LofRoutesApiView.as_view(),
        name='lof_routes'
    ),
    url(
        r'^departures/$',
        backend_views.DeparturesApiView.as_view(),
        name='departures'
    ),
    url(
        r'^arrivals/$',
        backend_views.ArrivalsApiView.as_view(),
        name='arrivals'
    ),
    url(
        r'^source-code/$',
        RedirectView.as_view(url='https://github.com/manueljrr/flights_dashboard'),
        name='source_code'
    ),
]
