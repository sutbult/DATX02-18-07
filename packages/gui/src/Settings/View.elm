module Settings.View exposing
    ( root
    )

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

import Settings.Types exposing (..)
import Bid.Types exposing
    ( currencyName
    )
import Error.View


root : Model -> Html Msg
root model =
    div []
        [ Html.map ToError <| Error.View.root model.error
        , div []
            [ h1 [class "subtitle"] [text "Blockchain paths"]
            , blockchainPathInputList
                (model.loading || model.saving)
                model.currentSettings.blockchainPathList
            ]
        , buttonRow model
        ]


blockchainPathInputList
    :  Bool
    -> List BlockchainPath
    -> Html Msg
blockchainPathInputList isDisabled =
    div []
        << List.map (blockchainPathInput isDisabled)


blockchainPathInput
    :  Bool
    -> BlockchainPath
    -> Html Msg
blockchainPathInput isDisabled blockchainPath =
    div [class "field"]
        [ label [class "label"]
            [ text <| currencyName blockchainPath.currency
            ]
        , div [class "control"]
            [ input
                [ class <| "input"
                , type_ "text"
                , placeholder "default path"
                , value blockchainPath.value
                , onInput (SetBlockchainPath blockchainPath.currency)
                , disabled isDisabled
                ] []
            ]
        ]


buttonRow : Model -> Html Msg
buttonRow model =
    let
        isDisabled =
            model.loading ||
            model.saving ||
            model.currentSettings == model.savedSettings

        saveExtraClass =
            if model.saving then
                " is-loading"
            else
                ""
    in
        div
            [ style
                [ ("text-align", "right")
                , ("margin-top", "20px")
                ]
            ]
            [ button
                [ class <| "button is-medium"
                , onClick Reset
                , disabled isDisabled
                ]
                [ text "Reset"
                ]
            , button
                [ class <| "button is-link is-medium" ++ saveExtraClass
                , onClick Save
                , disabled isDisabled
                ]
                [ text "Save"
                ]
            ]
