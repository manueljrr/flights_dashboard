# -*- coding: utf-8 -*-

from django.conf.urls import url
from landing import views as landing_views

urlpatterns = [
    url(
        r'^$',
        landing_views.IndexView.as_view(),
        name='index'
    ),
    url(
        r'^table/$',
        landing_views.TablesView.as_view(),
        name='table'
    ),
    url(
        r'^airport-traffic/$',
        landing_views.TrafficView.as_view(),
        name='traffic'
    ),
    url(
        r'^airport-routes/$',
        landing_views.FlightRoutesView.as_view(),
        name='routes'
    ),
    url(
        r'^lof-routes/$',
        landing_views.LofRoutesView.as_view(),
        name='lof_routes'
    ),
    url(
        r'^airport-charts/$',
        landing_views.AirportView.as_view(),
        name='airport_charts'
    ),
]

