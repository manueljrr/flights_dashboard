# -*- coding: utf-8 -*-

from django.views.generic import TemplateView

import numpy as np
import pandas as pd


class IndexView(TemplateView):
    template_name = 'landing/index.html'


class TablesView(TemplateView):
    template_name = 'landing/table-data.html'


class LofRoutesView(TemplateView):
    template_name = 'landing/maps/lof-routes.html'


class FlightRoutesView(TemplateView):
    template_name = 'landing/maps/flight-routes.html'


class TrafficView(TemplateView):
    template_name = 'landing/maps/traffic.html'


class AirportView(TemplateView):
    template_name = 'landing/charts/airport.html'


