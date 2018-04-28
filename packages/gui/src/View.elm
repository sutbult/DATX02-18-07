module View exposing (root)

import Html exposing (..)
import Html.Attributes exposing (..)

import Types exposing (..)
import Navigation.Types
import Navigation.View
import Password.View

root : Model -> Html Msg
root model =
    section [class "section"]
        [ div [class "container is-fullhd"]
            [ navigation model
            , Html.map mapPasswordCmd <|
                Password.View.root model.password
            ]
        ]

navigation : Model -> Html Msg
navigation model =
    case model.navigation of
        Just navigation ->
            if navigationInitialized navigation then
                Html.map mapNavigationCmd <|
                    Navigation.View.root navigation

            else
                loading "Fetching initial data"

        Nothing ->
            loading "Starting blockchain API server"


loading : String -> Html Msg
loading status =
    div []
        [ p
            [ class "subtitle"
            , style [("text-align", "center")]
            ]
            [ text status
            ]
        ]

navigationInitialized : Navigation.Types.Model -> Bool
navigationInitialized navigation = True
    && navigation.models.add.initialized
    && navigation.models.browse.bidList.initialized
    && navigation.models.userBids.bidList.initialized
    && navigation.models.acceptedBids.bidList.initialized
    && navigation.models.wallet.initialized
    && not navigation.models.settings.loading
