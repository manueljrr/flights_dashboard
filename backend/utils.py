# -*- coding: utf-8 -*-


def get_route_stats(group):
    return {'FLIGHTS': int(group.count()), 'DURATION': int(group.mean())}


