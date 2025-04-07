
# Routers package
# This init file ensures that all router modules are properly exposed for import

from . import auth
from . import itineraries
from . import weather
from . import places
from . import profile

__all__ = ['auth', 'itineraries', 'weather', 'places', 'profile']
